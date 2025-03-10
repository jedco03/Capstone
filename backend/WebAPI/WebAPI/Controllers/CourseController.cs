using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Models;
using WebAPI.Services;
using YourNamespace.Models;

[Route("api/courses")]
[ApiController]
public class CourseController : ControllerBase
{
    private readonly CourseService _courseService;
    private readonly AuditTrailService _auditTrailService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CourseController(
        CourseService courseService,
        AuditTrailService auditTrailService,
        IHttpContextAccessor httpContextAccessor)
    {
        _courseService = courseService;
        _auditTrailService = auditTrailService;
        _httpContextAccessor = httpContextAccessor;
    }

    // Get all courses
    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _courseService.GetAllCoursesAsync();
        return Ok(courses);
    }

    // Get a course by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourse(string id)
    {
        var course = await _courseService.GetCourseByIdAsync(id);
        if (course == null) return NotFound("Course not found.");
        return Ok(course);
    }

    // Create a new course
    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] Course course)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Extract user information from the token
        var user = _httpContextAccessor.HttpContext.User;
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
        var userFullName = user.FindFirst("fullName")?.Value; // Extract Full Name

        Console.WriteLine($"[LOG] Extracted User Details:");
        Console.WriteLine($"  - User ID: {userId}");
        Console.WriteLine($"  - User Full Name: {userFullName}");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
        {
            return Unauthorized("Invalid user credentials.");
        }

        // Create the course
        await _courseService.CreateCourseAsync(course);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Create Course", // Action
            userId, // User ID
            userFullName, // User Full Name
            course.Id, // Record ID
            null,
            $"Created a new course with ID: {course.Id} by {userFullName}." // Details
        );

        return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, course);
    }

    // Update an existing course
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(string id, [FromBody] Course course)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Extract user information from the token
        var user = _httpContextAccessor.HttpContext.User;
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
        var userFullName = user.FindFirst("fullName")?.Value; // Extract Full Name

        Console.WriteLine($"[LOG] Extracted User Details:");
        Console.WriteLine($"  - User ID: {userId}");
        Console.WriteLine($"  - User Full Name: {userFullName}");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
        {
            return Unauthorized("Invalid user credentials.");
        }

        var existingCourse = await _courseService.GetCourseByIdAsync(id);
        if (existingCourse == null)
        {
            return NotFound("Course not found.");
        }

        // Update the course
        course.Id = id; // Ensure the ID matches
        await _courseService.UpdateCourseAsync(id, course);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Update Course", // Action
            userId, // User ID
            userFullName, // User Full Name
            course.Id, // Record ID
            null, // Student Number (not applicable for courses)
            $"Updated course with ID: {course.Id} by {userFullName}." // Details
        );

        return NoContent();
    }

    // Delete a course
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(string id)
    {
        // Extract user information from the token
        var user = _httpContextAccessor.HttpContext.User;
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
        var userFullName = user.FindFirst("fullName")?.Value; // Extract Full Name

        Console.WriteLine($"[LOG] Extracted User Details:");
        Console.WriteLine($"  - User ID: {userId}");
        Console.WriteLine($"  - User Full Name: {userFullName}");

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userFullName))
        {
            return Unauthorized("Invalid user credentials.");
        }

        var course = await _courseService.GetCourseByIdAsync(id);
        if (course == null)
        {
            return NotFound("Course not found.");
        }

        // Delete the course
        await _courseService.DeleteCourseAsync(id);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Delete Course", // Action
            userId, // User ID
            userFullName, // User Full Name
            course.Id, // Record ID
            null, // Student Number (not applicable for courses)
            $"Deleted course with ID: {course.Id} by {userFullName}." // Details
        );

        return NoContent();
    }
}