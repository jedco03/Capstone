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
        public async Task CreateAsync(Student newStudent)
        {
            newStudent.Violations = new List<Violation>(); // Initialize as an empty list
            await _studentCollection.InsertOneAsync(newStudent);
        }

        //update student
        public async Task UpdateAsync(string id, Student updateStudent)
        {
            var objectId = new ObjectId(id);
            await _studentCollection.ReplaceOneAsync(x => x.Id == id, updateStudent);
        }

        public async Task AddViolationAsync(string studno, Violation newViolation)
        {
            var filter = Builders<Student>.Filter.Eq(x => x.StudentNumber, studno);
            var update = Builders<Student>.Update
                .Push(x => x.Violations, newViolation)
                .Inc(x => x.NumberOfViolations, 1);


            try
            {
                var result = await _studentCollection.UpdateOneAsync(filter, update);

                if (!result.IsAcknowledged)
                {
                    Console.WriteLine("Error: Update for student '{0}' was not acknowledged", studno);
                }
            }
            catch (MongoException ex)
            {
                throw new Exception("Database Error: Failed to add violation", ex);
            }
        }
        //get student by college for dean
        public async Task<List<Student>> GetStudentsByCollegeAsync(string college)
        {
            var filter = Builders<Student>.Filter.Eq(x => x.College, college);
            return await _studentCollection.Find(filter).ToListAsync();
        }
        //violation acknowledgement for dean
        public async Task<bool> AcknowledgeViolationAsync(string violationId)
        {
            var filter = Builders<Student>.Filter.ElemMatch(s => s.Violations, v => v.ViolationId == violationId);
            var update = Builders<Student>.Update.Set("violations.$.acknowledged", true);

            var result = await _studentCollection.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0; // Return true if the update was successful
        }
    }
}
