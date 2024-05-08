using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using WebAPI.Models;
using WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System;


namespace WebAPI.Controllers
{
    [Route("api/records")]
    [ApiController]
    public class RecordsController : ControllerBase
    {
        private readonly StudentServices _studentServices;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public RecordsController(StudentServices studentServices, IHttpContextAccessor httpContextAccessor)
        {
            _studentServices = studentServices;
            _httpContextAccessor = httpContextAccessor;
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
            await _studentServices.CreateAsync(newStudent);
            return CreatedAtAction(nameof(Get), new { id = newStudent.Id }, newStudent);
        }

    // PUT api/records/5
            
        [HttpPut("{studno}")]
        public async Task<ActionResult> Put(string studno, Student updateStudent)
        {
            Student student = await _studentServices.GetAsync(studno);
        if (student == null)
            {
                return NotFound("There is no Record with this id: " + studno);
            }

            updateStudent.Id = student.Id;

            await _studentServices.UpdateAsync(studno, updateStudent);

            return Ok("Updated Successfuly");
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
                await _studentServices.AddViolationAsync(studno, newViolation);
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

        //[Authorize(Policy = "DeanAccess")]
        [HttpGet("students-with-violations")]
        public async Task<IActionResult> GetStudentsWithViolationsForDean()
        {

            _httpContextAccessor.HttpContext.User.Identities.First().AddClaim(new Claim("College", "CEIS"));
            var deanCollege = _httpContextAccessor.HttpContext.User.FindFirst("College")?.Value;
            



            if (deanCollege is null)
            {
                return BadRequest("Dean's college information not found: ");
            }

            var students = await _studentServices.GetStudentsByCollegeAsync(deanCollege);
            return Ok(students);
        }

    }
 }

