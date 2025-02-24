using Microsoft.AspNetCore.Mvc;
using WebAPI.Services;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/violations")]
    [ApiController]
    public class ViolationController : ControllerBase
    {
        private readonly ViolationService _violationService;

        public ViolationController(ViolationService violationService)
        {
            _violationService = violationService;
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

            await _violationService.CreateViolationAsync(violation);
            return CreatedAtAction(nameof(GetViolationById), new { id = violation.Id }, violation);
        }

        // Update existing violation
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateViolation(string id, [FromBody] ViolationType updatedViolation)
        {
            var existingViolation = await _violationService.GetViolationByIdAsync(id);
            if (existingViolation == null)
                return NotFound(new { message = "Violation not found" });

            await _violationService.UpdateViolationAsync(id, updatedViolation);
            return NoContent();
        }

        // Delete a violation
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteViolation(string id)
        {
            var existingViolation = await _violationService.GetViolationByIdAsync(id);
            if (existingViolation == null)
                return NotFound(new { message = "Violation not found" });

            await _violationService.DeleteViolationAsync(id);
            return NoContent();
        }
    }
}
