using MongoDB.Driver;
using YourNamespace.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using WebAPI.Data;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class CourseService
    {
        private readonly IMongoCollection<Course> _coursesCollection;

        public CourseService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _coursesCollection = mongoDb.GetCollection<Course>("courseColl");
        }

        // Get all courses
        public async Task<List<Course>> GetAllCoursesAsync()
        {
            return await _coursesCollection.Find(_ => true).ToListAsync();
        }

        // Get a course by ID
        public async Task<Course> GetCourseByIdAsync(string id)
        {
            return await _coursesCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        // Create a new course
        public async Task CreateCourseAsync(Course course)
        {
            await _coursesCollection.InsertOneAsync(course);
        }

        // Update an existing course
        public async Task UpdateCourseAsync(string id, Course course)
        {
            await _coursesCollection.ReplaceOneAsync(c => c.Id == id, course);
        }

        // Delete a course
        public async Task DeleteCourseAsync(string id)
        {
            await _coursesCollection.DeleteOneAsync(c => c.Id == id);
        }


    }
}