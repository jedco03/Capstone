using Microsoft.AspNetCore.Mvc;
using WebAPI.Models;
using WebAPI.Services;


namespace WebAPI.Controllers
{
        [Route("api/records")]
        [ApiController]
        public class RecordsController : ControllerBase
        {
            private readonly StudentServices _studentServices;
            public RecordsController(StudentServices studentServices)
            {
                _studentServices = studentServices;
            }

            // GET: api/records
            [HttpGet]
            public async Task<List<Student>> Get() => await _studentServices.GetAsync();

            // GET api/records/5
            [HttpGet("{studno}")]
            public async Task<ActionResult<Student>> Get(string studno)
            {
                Student student = await _studentServices.GetAsync(studno);
                if (student == null)
                {
                    return NotFound();
                }
                return student;
            }

            // POST api/records
            [HttpPost]
            public async Task<ActionResult<Student>> Post(Student newStudent)
            {
                await _studentServices.CreateAsync(newStudent);
                return CreatedAtAction(nameof(Get), new { id = newStudent.Id }, newStudent);
            }

            // PUT api/records/5
            [HttpPut("{id}")]
            public async Task<ActionResult> Put(string id, Student updateStudent)
            {
                Student student = await _studentServices.GetAsync(id);
                if (student == null)
                {
                    return NotFound("There is no Record with this id: " + id);
                }

                updateStudent.Id = student.Id;

                await _studentServices.UpdateAsync(id, updateStudent);

                return Ok("Updated Successfuly");
            }

            // DELETE api/<RecordsController>/5
            [HttpDelete("{id}")]
            public void Delete(int id)
            {
            }
        }
    }

