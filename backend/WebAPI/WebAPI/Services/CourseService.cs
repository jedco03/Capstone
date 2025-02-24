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

        public async Task<List<Course>> GetAllCoursesAsync()
        {
            return await _coursesCollection.Find(_ => true).ToListAsync();
        }

        public async Task<Course> GetCourseByIdAsync(string id)
        {
            return await _coursesCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
        }
    }
}
