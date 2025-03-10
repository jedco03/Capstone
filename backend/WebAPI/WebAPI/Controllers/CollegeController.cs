using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Models;
using WebAPI.Services;

[Route("api/colleges")]
[ApiController]
public class CollegeController : ControllerBase
{
    private readonly CollegeService _collegeService;
    private readonly AuditTrailService _auditTrailService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CollegeController(
        CollegeService collegeService,
        AuditTrailService auditTrailService,
        IHttpContextAccessor httpContextAccessor)
    {
        _collegeService = collegeService;
        _auditTrailService = auditTrailService;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpGet]
    public async Task<IActionResult> GetColleges()
    {
        var colleges = await _collegeService.GetAllCollegesAsync();
        return Ok(colleges);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCollege(string id)
    {
        var college = await _collegeService.GetCollegeByIdAsync(id);
        if (college == null) return NotFound("College not found.");
        return Ok(college);
    }

    // POST: api/colleges
    [HttpPost]
    public async Task<IActionResult> CreateCollege([FromBody] College college)
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

        // Create the college
        await _collegeService.CreateCollegeAsync(college);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Create College", // Action
            userId, // User ID
            userFullName, // User Name
            college.Id, // Record ID
            null, // Student Number (not applicable for colleges)
            $"Created a new college with ID: {college.Id} by {userFullName}." // Details
        );

        return CreatedAtAction(nameof(GetCollege), new { id = college.Id }, college);
    }

    // PUT: api/colleges/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCollege(string id, [FromBody] College college)
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

        var existingCollege = await _collegeService.GetCollegeByIdAsync(id);
        if (existingCollege == null)
        {
            return NotFound("College not found.");
        }

        // Update the college
        college.Id = id; // Ensure the ID matches
        await _collegeService.UpdateCollegeAsync(id, college);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Update College", // Action
            userId, // User ID
            userFullName, // User Name
            college.Id, // Record ID
            null, // Student Number (not applicable for colleges)
            $"Updated college with ID: {college.Id} by {userFullName}." // Details
        );

        return NoContent();
    }

    // DELETE: api/colleges/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCollege(string id)
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

        var college = await _collegeService.GetCollegeByIdAsync(id);
        if (college == null)
        {
            return NotFound("College not found.");
        }

        // Delete the college
        await _collegeService.DeleteCollegeAsync(id);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Delete College", // Action
            userId, // User ID
            userFullName, // User Name
            college.Id, // Record ID
            null, // Student Number (not applicable for colleges)
            $"Deleted college with ID: {college.Id} by {userFullName}." // Details
        );

        return NoContent();
    }
}