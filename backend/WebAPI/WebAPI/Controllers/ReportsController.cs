using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Dtos;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [Route("api/reports")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IMongoCollection<GuardReports> _guardReportsCollection;
        private readonly IMongoCollection<Student> _studentCollection;
        private readonly IMongoCollection<Violation> _violationsCollection;

        public ReportsController(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);

            _guardReportsCollection = mongoDb.GetCollection<GuardReports>("guard_logs");
            _studentCollection = mongoDb.GetCollection<Student>("students");
            _violationsCollection = mongoDb.GetCollection<Violation>("violations");
        }


        [HttpGet]
        public async Task<ActionResult<List<GuardReports>>> GetGuardReports()
        {
            var guardReports = await _guardReportsCollection
                .Find(_ => true)
                .Sort(Builders<GuardReports>.Sort.Ascending(r => r.isViewed))
                .ToListAsync();

            return Ok(guardReports);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateReport(string id, [FromBody] UpdateReportDto updateDto)
        {
            var filter = Builders<GuardReports>.Filter.Eq(r => r.Id, id);
            var updateDefinition = new List<UpdateDefinition<GuardReports>>();

            if (updateDto.IsViewed)
            {
                updateDefinition.Add(Builders<GuardReports>.Update.Set(r => r.isViewed, updateDto.IsViewed));
            }

            if (updateDto.IsPassed)
            {
                updateDefinition.Add(Builders<GuardReports>.Update.Set(r => r.isPassed, updateDto.IsPassed));
            }

            var update = Builders<GuardReports>.Update.Combine(updateDefinition);
            var result = await _guardReportsCollection.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPatch("bulk-approve")]
        public async Task<IActionResult> BulkApprove([FromBody] BulkApproveDto bulkApproveDto)
        {
            if (bulkApproveDto?.Reports == null || bulkApproveDto.Reports.Count == 0)
            {
                return BadRequest("No reports provided.");
            }

            try
            {
                var reportIds = new List<string>();

                foreach (var report in bulkApproveDto.Reports)
                {
                    var studentFilter = Builders<Student>.Filter.Eq(s => s.StudentNumber, report.studentNumber);
                    var student = await _studentCollection.Find(studentFilter).FirstOrDefaultAsync();

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

                        await _studentCollection.InsertOneAsync(newStudent);
                        student = newStudent;
                    }

                    var newViolation = new Violation
                    {
                        ViolationId = report.violation ?? "Missing violationId",
                        Remarks = report.remarks ?? "No remarks provided",
                        guardName = report.guardName ?? "Unknown guard",
                        IsIDInPossession = report.IsIDInPossession,
                        Date = DateTime.UtcNow,
                        Acknowledged = false
                    };

                    var updateViolation = Builders<Student>.Update.Push(s => s.Violations, newViolation);
                    await _studentCollection.UpdateOneAsync(studentFilter, updateViolation);

                    reportIds.Add(report.Id);
                }

                var reportFilter = Builders<GuardReports>.Filter.In(r => r.Id, reportIds);
                var updatePassed = Builders<GuardReports>.Update.Set(r => r.isPassed, true);
                var result = await _guardReportsCollection.UpdateManyAsync(reportFilter, updatePassed);

                return Ok($"{result.ModifiedCount} reports approved successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}