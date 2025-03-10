using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPI.Models;
using WebAPI.Services;
using YourNamespace.Models;

[Route("api/violations")]
[ApiController]
public class ViolationController : ControllerBase
{
    private readonly ViolationService _violationService;
    private readonly AuditTrailService _auditTrailService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ViolationController(
        ViolationService violationService,
        AuditTrailService auditTrailService,
        IHttpContextAccessor httpContextAccessor)
    {
        _violationService = violationService;
        _auditTrailService = auditTrailService;
        _httpContextAccessor = httpContextAccessor;
    }

    // Get all violations
    [HttpGet]
    public async Task<IActionResult> GetAllViolations()
    {
        var violations = await _violationService.GetAllViolationsAsync();
        return Ok(violations);
    }

    // Get violation by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetViolationById(string id)
    {
        var violation = await _violationService.GetViolationByIdAsync(id);
        if (violation == null)
            return NotFound(new { message = "Violation not found" });

        return Ok(violation);
    }

    // Create new violation
    [HttpPost]
    public async Task<IActionResult> CreateViolation([FromBody] ViolationType violation)
    {
        if (violation == null)
            return BadRequest(new { message = "Invalid data" });

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

        // Create the violation
        await _violationService.CreateViolationAsync(violation);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Create Violation", // Action
            userId, // User ID
            userFullName, // User Full Name
            violation.Id, // Record ID
            null, // Student Number (null as per requirement)
            $"Created a new violation with ID: {violation.Id} by {userFullName}." // Details
        );

        return CreatedAtAction(nameof(GetViolationById), new { id = violation.Id }, violation);
    }

    // Update existing violation
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateViolation(string id, [FromBody] ViolationType updatedViolation)
    {
        var existingViolation = await _violationService.GetViolationByIdAsync(id);
        if (existingViolation == null)
            return NotFound(new { message = "Violation not found" });

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

        // Update the violation
        await _violationService.UpdateViolationAsync(id, updatedViolation);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Update Violation", // Action
            userId, // User ID
            userFullName, // User Full Name
            id, // Record ID
            null, // Student Number (null as per requirement)
            $"Updated violation with ID: {id} by {userFullName}." // Details
        );

        return NoContent();
    }

    // Delete a violation
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteViolation(string id)
    {
        var existingViolation = await _violationService.GetViolationByIdAsync(id);
        if (existingViolation == null)
            return NotFound(new { message = "Violation not found" });

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

        // Delete the violation
        await _violationService.DeleteViolationAsync(id);

        // Log the action to the audit trail
        await _auditTrailService.LogActionAsync(
            "Delete Violation", // Action
            userId, // User ID
            userFullName, // User Full Name
            id, // Record ID
            null, // Student Number (null as per requirement)
            $"Deleted violation with ID: {id} by {userFullName}." // Details
        );

        return NoContent();
    }
}