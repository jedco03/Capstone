using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuditTrailController : ControllerBase
{
    private readonly AuditTrailService _auditTrailService;

    public AuditTrailController(AuditTrailService auditTrailService)
    {
        _auditTrailService = auditTrailService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAuditTrails([FromQuery] string action = null)
    {
        try
        {
            var auditTrails = await _auditTrailService.GetAuditTrailsAsync(action);

            // Replace null values with "N/A"
            var formattedAuditTrails = auditTrails.Select(audit => new
            {
                id = audit.Id,
                action = audit.Action,
                userId = audit.UserId ?? "N/A",
                userName = audit.UserName ?? "N/A",
                recordId = audit.RecordId ?? "N/A",
                studentNumber = audit.StudentNumber ?? "N/A",
                timestamp = audit.Timestamp,
                details = audit.Details ?? "N/A"
            }).ToList();

            return Ok(formattedAuditTrails);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            return StatusCode(500, "An error occurred while fetching audit trails.");
        }
    }
}