using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using WebAPI.Models;
using WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;
using Newtonsoft.Json.Linq;
using WebAPI.Dtos;


namespace WebAPI.Controllers
{
    [Route("api/records")]
    [ApiController]
    public class RecordsController : ControllerBase
    {
        private readonly StudentServices _studentServices;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AuditTrailService _auditTrailService;
        private readonly CollegeService _collegeService;
        private readonly CourseService _courseService;
        private readonly YearService _yearService;
        public RecordsController(StudentServices studentServices, IHttpContextAccessor httpContextAccessor, AuditTrailService auditTrailService, CollegeService collegeservice, CourseService courseservice, YearService yearservice)
        {
            _studentServices = studentServices;
            _httpContextAccessor = httpContextAccessor;
            _auditTrailService = auditTrailService;
            _collegeService = collegeservice;
            _courseService = courseservice;
            _yearService = yearservice;
        }

        // GET: api/records

        [HttpGet]
            public async Task<List<Student>> Get() => await _studentServices.GetAsync();

    // GET api/records/5
            
        [HttpGet("{studno}")]
        public async Task<ActionResult<Student>> Get(string studno)
        {
            Student student = await _studentServices.GetAsync(studno);
            if (student == null)
            {
                return NotFound();
            }
            return student;
        }

        // POST api/records

        [HttpPost]
        public async Task<ActionResult<Student>> Post(Student newStudent)
        {
            // Get user information from the request headers
            var userId = Request.Headers["User-Id"].FirstOrDefault();
            var userName = Request.Headers["User-Name"].FirstOrDefault();

            Console.WriteLine($"Received User-Id: {userId}");
            Console.WriteLine($"Received User-Name: {userName}");

            // Add the new student record
            await _studentServices.CreateAsync(newStudent);

            // Log the "Add Record" action
            await _auditTrailService.LogActionAsync(
                "Add Record",
                userId,
                userName,
                newStudent.Id, // Record ID
                newStudent.StudentNumber,
                $"Added a new student record with ID: {newStudent.Id}"
            );

            return CreatedAtAction(nameof(Get), new { id = newStudent.Id }, newStudent);
        }

        // PUT api/records/5

        [HttpPut("{studno}")]
        public async Task<ActionResult> Put(string studno, Student updateStudent)
        {
            try
            {
                // Extract user information from the token
                var user = _httpContextAccessor.HttpContext.User;
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userFullName = user.FindFirst("fullName")?.Value;

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
                {
                    return Unauthorized("Invalid user credentials.");
                }

                // Fetch existing student record
                Student student = await _studentServices.GetAsync(studno);
                if (student == null)
                {
                    return NotFound($"There is no Record with this ID: {studno}");
                }

                // Preserve existing ID
                updateStudent.Id = student.Id;

                // Extract guard name from the existing violations (assuming the latest violation is the relevant one)
                var latestViolation = student.Violations?.LastOrDefault();
                string guardName = latestViolation?.guardName ?? "Unknown Guard";

                // Update student record
                await _studentServices.UpdateAsync(studno, updateStudent);

                // Log the action to the audit trail
                await _auditTrailService.LogActionAsync(
                    "Report Reviewed", // Action type
                    userId, // User ID
                    userFullName, // User Full Name
                    student.Id, // Student Record ID
                    studno, // Student Number
                    $"Report by {guardName} for {studno} was reviewed and passed by {userFullName}." // Description
                );

                return Ok("Updated Successfully");
            }
            catch (MongoException ex)
            {
                Console.WriteLine("MongoDB Error: {0}", ex.Message);
                return BadRequest("Failed to update student record");
            }
            catch (Exception ex)
            {
                Console.WriteLine("General Error: {0}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }


        // DELETE api/<RecordsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }



        [HttpPost("addViolation/{studno}")]
        public async Task<IActionResult> AddViolation(string studno, [FromBody] Violation newViolation)
        {
            try
            {
                // Extract user information from the token
                var user = _httpContextAccessor.HttpContext.User;
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // ✅ Extract User ID
                var userFullName = user.FindFirst("fullName")?.Value; // ✅ Extract Full Name (instead of username)
                var userName = user.FindFirst(ClaimTypes.Name)?.Value; // Extract username from token

                Console.WriteLine($"[LOG] Extracted User Details:");
                Console.WriteLine($"  - User ID: {userId}");
                Console.WriteLine($"  - User Name: {userFullName}");

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
                {
                    return Unauthorized("Invalid user credentials.");
                }

                // Assign the guardName from the extracted userFullName
                newViolation.guardName = userFullName;

                // Add the violation
                await _studentServices.AddViolationAsync(studno, newViolation);

                // Log the action to the audit trail
                await _auditTrailService.LogActionAsync(
                    "Add Violation", // Action
                    userId, // User ID
                    userFullName, //user full name
                    newViolation.RecordId, //record id
                    studno, //student number
                    $"Added a new violation for student {studno} by {userFullName}." // Description
                );
                
                return Ok("Violation added successfully");
            }
            catch (MongoException ex)
            {
                // Log the error (or handle differently)
                Console.WriteLine("MongoDB Error: {0}", ex.Message);
                return BadRequest("Failed to add violation");
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine("General Error: {0}", ex.Message);
                return StatusCode(500, "Internal server error"); // 500 for general server errors
            }
        }

        [HttpPut("UpdateRecord/{studno}")]
        public async Task<ActionResult> UpdateRecord(string studno, StudentDto updateStudentDto)
        {
            try
            {
                Console.WriteLine("Student Number: " + studno);

                // ✅ Fetch the student record using the student number
                Student student = await _studentServices.GetAsync(studno);
                if (student == null)
                {
                    return NotFound($"There is no Record with this Student Number: {studno}");
                }

                // ✅ Fetch the College by _id
                var college = await _collegeService.GetCollegeByIdAsync(updateStudentDto.College);
                if (college == null)
                {
                    return BadRequest("Invalid College selected.");
                }

                // ✅ Fetch the Course by _id
                var course = await _courseService.GetCourseByIdAsync(updateStudentDto.Course);
                if (course == null)
                {
                    return BadRequest("Invalid Course selected.");
                }

                // ✅ Fetch the Year by _id
                var year = await _yearService.GetYearByIdAsync(updateStudentDto.Year);
                if (year == null)
                {
                    return BadRequest("Invalid Year selected.");
                }

                // ✅ Map the fields
                student.StudentNumber = updateStudentDto.StudentNumber;
                student.Email = updateStudentDto.Email;
                student.FirstName = updateStudentDto.FirstName;
                student.LastName = updateStudentDto.LastName;
                student.MiddleName = updateStudentDto.MiddleName;
                student.YearId = year.Id;
                student.CollegeId = college.Id;
                student.CourseId = course.Id;
                student.Gender = updateStudentDto.Gender;
                student.PhoneNumber = updateStudentDto.PhoneNumber;
                student.Guardian = updateStudentDto.Guardian;

                // ✅ Use the new method
                await _studentServices.UpdateByStudentNumberAsync(studno, student);

                // ✅ Log the update
                var user = _httpContextAccessor.HttpContext.User;
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userFullName = user.FindFirst("fullName")?.Value;

                await _auditTrailService.LogActionAsync(
                    "Record Updated",
                    userId,
                    userFullName,
                    student.Id,
                    studno,
                    $"Record for {studno} was updated by {userFullName}."
                );

                return Ok("Record Updated Successfully");
            }
            catch (MongoException ex)
            {
                Console.WriteLine("MongoDB Error: {0}", ex.Message);
                return BadRequest("Failed to update student record");
            }
            catch (Exception ex)
            {
                Console.WriteLine("General Error: {0}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }




        [Authorize(Policy = "DeanAccess")]
        [HttpGet("students-with-violations")]
        public async Task<IActionResult> GetStudentsWithViolationsForDean()
        {
            try
            {
                var user = _httpContextAccessor.HttpContext.User;
                var collegeId = user.FindFirst("college")?.Value;
                var role = user.FindFirst(ClaimTypes.Role)?.Value;

                // Debugging: Print claims to console
                Console.WriteLine($"User Claims: {string.Join(", ", user.Claims.Select(c => $"{c.Type}: {c.Value}"))}");

                if (role != "Dean")
                {
                    return Unauthorized(new { message = "User is not a dean." });
                }

                if (string.IsNullOrEmpty(collegeId))
                {
                    return Unauthorized(new { message = "College information not found." });
                }

                var students = await _studentServices.GetStudentsByCollegeAsync(collegeId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.Error.WriteLine($"Error in GetStudentsWithViolationsForDean: {ex}");
                return StatusCode(500, new { message = "An error occurred while processing your request." });
            }
        }


        [Authorize(Policy = "DeanAccess")]
        [HttpPut("acknowledge/{recordId}")]
        public async Task<IActionResult> AcknowledgeViolation(string recordId)
        {
            var user = _httpContextAccessor.HttpContext.User;
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // ✅ Extract User ID
            var userFullName = user.FindFirst("fullName")?.Value; // ✅ Extract Full Name (instead of username)
            var userName = user.FindFirst(ClaimTypes.Name)?.Value; // Extract username from token

            Console.WriteLine($"[LOG] Extracted User Details:");
            Console.WriteLine($"  - User ID: {userId}");
            Console.WriteLine($"  - User Name: {userFullName}");

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
            {
                return Unauthorized("Invalid user credentials.");
            }

            var result = await _studentServices.AcknowledgeViolationAsync(recordId);

            if (result)
            {
                await _auditTrailService.LogActionAsync(
                    "Acknowledge Violation",
                    userId,  // Extracted from token
                    userFullName, // Extracted from token
                    recordId, 
                    "Violations",
                    $"Violation record {recordId} was acknowledged by {userFullName}."
                );

                return NoContent();
            }

            return NotFound();
        }



        [HttpPut("markAsResolved/{violationId}")]
        public async Task<IActionResult> MarkAsResolved(string violationId)
        {
            try
            {
                // Extract user information from the token
                var user = _httpContextAccessor.HttpContext.User;
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // ✅ Extract User ID
                var userFullName = user.FindFirst("fullName")?.Value; // ✅ Extract Full Name (instead of username)
                var userName = user.FindFirst(ClaimTypes.Name)?.Value; // Extract username from token

                Console.WriteLine($"[LOG] Extracted User Details:");
                Console.WriteLine($"  - User ID: {userId}");
                Console.WriteLine($"  - User Name: {userFullName}");

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
                {
                    return Unauthorized("Invalid user credentials.");
                }

                // Mark the violation as resolved and get the student number
                var (success, studno) = await _studentServices.MarkViolationAsResolvedAsync(violationId);

                if (!success)
                {
                    return NotFound("Violation not found.");
                }

                // Log the action to the audit trail
                await _auditTrailService.LogActionAsync(
                    "Mark as Resolved", // Action
                    userId, // User ID
                    userFullName, // User Full Name
                    violationId, // Violation ID (record ID)
                    studno, // Student Number
                    $"Marked violation {violationId} as resolved by {userFullName}." // Description
                );

                return Ok("Violation marked as resolved successfully");
            }
            catch (MongoException ex)
            {
                // Log the error (or handle differently)
                Console.WriteLine("MongoDB Error: {0}", ex.Message);
                return BadRequest("Failed to mark violation as resolved");
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine("General Error: {0}", ex.Message);
                return StatusCode(500, "Internal server error"); // 500 for general server errors
            }
        }

        [HttpPost("bulkApprove")]
        public async Task<IActionResult> BulkApprove([FromBody] List<GuardReports> reports)
        {
            try
            {
                var user = _httpContextAccessor.HttpContext.User;
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userFullName = user.FindFirst("fullName")?.Value;

                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
                {
                    return Unauthorized("Invalid user credentials.");
                }

                List<string> processedReports = new List<string>();

                foreach (var report in reports)
                {
                    // Check if student exists, add if necessary
                    var student = await _studentServices.GetAsync(report.studentNumber);
                    if (student == null)
                    {
                        var newStudent = new Student
                        {
                            StudentNumber = report.studentNumber,
                            Email = report.email,
                            FirstName = report.firstName,
                            LastName = report.lastName,
                            MiddleName = report.middleName ?? "",
                            YearId = report.yearId,
                            CollegeId = report.collegeId,
                            CourseId = report.courseId ?? "",
                            Gender = report.gender,
                            PhoneNumber = report.phoneNumber ?? "",
                            Guardian = report.guardian ?? "",
                            Violations = new List<Violation>()
                        };

                        await _studentServices.CreateAsync(newStudent);
                        await _auditTrailService.LogActionAsync(
                            "Add Record",
                            userId,
                            userFullName,
                            newStudent.Id,
                            newStudent.StudentNumber,
                            $"Added a new student record for {newStudent.StudentNumber}"
                        );
                    }

                    // Add Violation
                    var newViolation = new Violation
                    {
                        ViolationId = report.violation ?? "Missing violationId",
                        Remarks = report.remarks ?? "No remarks provided",
                        guardName = report.guardName ?? "Unknown guard",
                        Status = report.status,
                        IsIDInPossession = report.IsIDInPossession
                    };

                    await _studentServices.AddViolationAsync(report.studentNumber, newViolation);
                    await _auditTrailService.LogActionAsync(
                        "Add Violation",
                        userId,
                        userFullName,
                        newViolation.RecordId,
                        report.studentNumber,
                        $"Report by {report.guardName} for {report.studentNumber} was reviewed and passed by {userFullName}."
                    );

                    processedReports.Add(report.Id);
                }

                // Mark all reports as "passed"
                await _studentServices.MarkReportsAsPassed(processedReports);

                return Ok("Bulk approval completed.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in bulk approval: {0}", ex.Message);
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("violationdetails/{recordId}")]
        public async Task<IActionResult> GetViolationByRecordId(string recordId)
        {
            try
            {
                // Fetch the violation details
                var violation = await _studentServices.GetViolationByRecordIdAsync(recordId);

                if (violation == null)
                {
                    return NotFound($"Violation with Record ID {recordId} not found.");
                }

                return Ok(violation);
            }
            catch (MongoException ex)
            {
                Console.WriteLine("MongoDB Error: {0}", ex.Message);
                return BadRequest("Failed to fetch violation details.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("General Error: {0}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }

    }
}

