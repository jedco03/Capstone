using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Models;
using WebAPI.Services;

[Route("api/semesters")]
[ApiController]
public class SemesterController : ControllerBase
{
    private readonly SemesterService _semesterService;
    private readonly AuditTrailService _auditTrailService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public SemesterController(
        SemesterService semesterService,
        AuditTrailService auditTrailService,
        IHttpContextAccessor httpContextAccessor)
    {
        _semesterService = semesterService;
        _auditTrailService = auditTrailService;
        _httpContextAccessor = httpContextAccessor;
    }

    // GET: api/semesters
    [HttpGet]
    public async Task<IActionResult> GetSemesters()
    {
        var semesters = await _semesterService.GetAllSemestersAsync();
        return Ok(semesters);
    }

    // GET: api/semesters/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetSemester(string id)
    {
        var semester = await _semesterService.GetSemesterByIdAsync(id);
        if (semester == null) return NotFound("Semester not found.");
        return Ok(semester);
    }

    // POST: api/semesters
    [HttpPost]
    public async Task<IActionResult> CreateSemester([FromBody] Semester semester)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Extract user information from the token
        var user = _httpContextAccessor.HttpContext.User;
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
        var userFullName = user.FindFirst("fullName")?.Value;

        Console.WriteLine($"[LOG] Extracted User Details:");
        Console.WriteLine($"  - User ID: {userId}");
        Console.WriteLine($"  - User Name: {userFullName}");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
        {
            return Unauthorized("Invalid user credentials.");
        }

        // Create the semester
        await _semesterService.CreateSemesterAsync(semester);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Create Semester", // Action
            userId, // User ID
            userFullName, // User Name
            semester.Id, // Record ID
            null, // Student Number (not applicable for semesters)
            $"Created a new semester with ID: {semester.Id} by {userFullName}." // Details
        );

        return CreatedAtAction(nameof(GetSemester), new { id = semester.Id }, semester);
    }

    // PUT: api/semesters/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSemester(string id, [FromBody] Semester semester)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Extract user information from the token
        var user = _httpContextAccessor.HttpContext.User;
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
        var userFullName = user.FindFirst("fullName")?.Value;

        Console.WriteLine($"[LOG] Extracted User Details:");
        Console.WriteLine($"  - User ID: {userId}");
        Console.WriteLine($"  - User Name: {userFullName}");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
        {
            return Unauthorized("Invalid user credentials.");
        }

        var existingSemester = await _semesterService.GetSemesterByIdAsync(id);
        if (existingSemester == null)
        {
            return NotFound("Semester not found.");
        }

        existingSemester.SemesterId = semester.SemesterId;
        existingSemester.AcademicYear = semester.AcademicYear;
        existingSemester.SemesterName = semester.SemesterName;
        existingSemester.StartDate = semester.StartDate;
        existingSemester.EndDate = semester.EndDate;

        await _semesterService.UpdateSemesterAsync(id, existingSemester);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Update Semester", // Action
            userId, // User ID
            userFullName, // User Name
            id, // Record ID
            null, // Student Number (not applicable for semesters)
            $"Updated semester with ID: {semester.SemesterId} by {userFullName}." // Details
        );

        return NoContent();
    }

    // DELETE: api/semesters/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSemester(string id)
    {
        // Extract user information from the token
        var user = _httpContextAccessor.HttpContext.User;
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
        var userFullName = user.FindFirst("fullName")?.Value;

        Console.WriteLine($"[LOG] Extracted User Details:");
        Console.WriteLine($"  - User ID: {userId}");
        Console.WriteLine($"  - User Name: {userFullName}");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
        {
            return Unauthorized("Invalid user credentials.");
        }

        var semester = await _semesterService.GetSemesterByIdAsync(id);
        if (semester == null)
        {
            return NotFound("Semester not found.");
        }

        // Delete the semester
        await _semesterService.DeleteSemesterAsync(id);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Delete Semester", // Action
            userId, // User ID
            userFullName, // User Name
            semester.Id, // Record ID
            null, // Student Number (not applicable for semesters)
            $"Deleted semester with ID: {semester.Id} by {userFullName}." // Details
        );

        return NoContent();
    }
}