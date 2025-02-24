using Microsoft.AspNetCore.Mvc;
using WebAPI.Models;
using WebAPI.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebAPI.Controllers
{
    [Route("api/years")]
    [ApiController]
    public class YearController : ControllerBase
    {
        private readonly YearService _yearService;

        public YearController(YearService yearService)
        {
            _yearService = yearService;
        }

        // GET: api/years
        [HttpGet]
        public async Task<ActionResult<List<Year>>> GetAllYears()
        {
            return await _yearService.GetAllYearsAsync();
        }

        // GET: api/years/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Year>> GetYearById(string id)
        {
            var year = await _yearService.GetYearByIdAsync(id);
            if (year == null)
            {
                return NotFound();
            }
            return year;
        }

        // POST: api/years
        [HttpPost]
        public async Task<IActionResult> CreateYear(Year year)
        {
            await _yearService.CreateYearAsync(year);
            return CreatedAtAction(nameof(GetYearById), new { id = year.Id }, year);
        }

        // PUT: api/years/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateYear(string id, Year updatedYear)
        {
            var existingYear = await _yearService.GetYearByIdAsync(id);
            if (existingYear == null)
            {
                return NotFound();
            }

            updatedYear.Id = id;
            await _yearService.UpdateYearAsync(id, updatedYear);
            return NoContent();
        }

        // DELETE: api/years/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteYear(string id)
        {
            var existingYear = await _yearService.GetYearByIdAsync(id);
            if (existingYear == null)
            {
                return NotFound();
            }

            await _yearService.DeleteYearAsync(id);
            return NoContent();
        }
    }
}
