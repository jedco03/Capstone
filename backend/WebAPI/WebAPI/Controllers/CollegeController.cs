using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebAPI.Models;

[Route("api/colleges")]
[ApiController]
public class CollegeController : ControllerBase
{
    private readonly CollegeService _collegeService;

    public CollegeController(CollegeService collegeService)
    {
        _collegeService = collegeService;
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
}
