using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using WebAPI.Data;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class StudentServices
    {
        private readonly IMongoCollection<Student> _studentCollection;

        public StudentServices(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _studentCollection = mongoDb.GetCollection<Student>(settings.Value.CollectionName);
        }

        //get all students
        public async Task<List<Student>> GetAsync()
        {
            return await _studentCollection.Find(_ => true).ToListAsync();
        }

        //get student by id
        public async Task<Student> GetAsync(string studno)
        {
            return await _studentCollection.Find(x => x.StudentNumber == studno).FirstOrDefaultAsync();
        }

        //add new student
        public async Task CreateAsync(Student newStudent) => await _studentCollection.InsertOneAsync(newStudent);

        //update student
        public async Task UpdateAsync(string id, Student updateStudent)
        {
            var objectId = new ObjectId(id);
            await _studentCollection.ReplaceOneAsync(x => x.Id == id, updateStudent);
        }
    }
}
