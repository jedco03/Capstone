using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using WebAPI.Models;
using WebAPI.Services;

[Route("api/courses")]
[ApiController]
public class CourseController : ControllerBase
{
    private readonly CourseService _courseService;

    public CourseController(CourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _courseService.GetAllCoursesAsync();
        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourse(string id)
    {
        var course = await _courseService.GetCourseByIdAsync(id);
        if (course == null) return NotFound("Course not found.");
        return Ok(course);
    }
}
