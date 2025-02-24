using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using WebAPI.Data;
using WebAPI.Models;
using YourNamespace.Models;

namespace WebAPI.Services
{
    public class StudentServices
    {
        private readonly IMongoCollection<Student> _studentCollection;
        private readonly IMongoCollection<College> _collegeCollection;
        private readonly IMongoCollection<Year> _yearCollection;
        private readonly IMongoCollection<Course> _courseCollection;
        private readonly IMongoCollection<ViolationType> _violationCollection;
        private readonly CollegeService _collegeService;
        private readonly YearService _yearService;
        private readonly ViolationService _violationService;

        public StudentServices(IOptions<DatabaseSettings> settings, CollegeService collegeService, YearService yearService, ViolationService violationService)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _studentCollection = mongoDb.GetCollection<Student>(settings.Value.CollectionName);
            _collegeCollection = mongoDb.GetCollection<College>("collegeColl");
            _yearCollection = mongoDb.GetCollection<Year>("yearColl");
            _courseCollection = mongoDb.GetCollection<Course>("courseColl");
            _violationCollection = mongoDb.GetCollection<ViolationType>("violationsColl");

            _collegeService = collegeService;
            _yearService = yearService;
            _violationService = violationService;
        }

        public async Task<List<Student>> GetAsync()
        {
            var students = await _studentCollection.Find(_ => true).ToListAsync();
            var colleges = await _collegeService.GetAllCollegesAsync();
            var years = await _yearCollection.Find(_ => true).ToListAsync();
            var courses = await _courseCollection.Find(_ => true).ToListAsync();

            return students.Select(student => new Student
            {
                Id = student.Id,
                StudentNumber = student.StudentNumber,
                FirstName = student.FirstName,
                LastName = student.LastName,
                MiddleName = student.MiddleName,
                CollegeId = colleges.FirstOrDefault(c => c.Id == student.CollegeId)?.Name ?? "Unknown",
                YearId = years.FirstOrDefault(y => y.Id == student.YearId)?.Name ?? "Unknown",
                CourseId = courses.FirstOrDefault(c => c.Id == student.CourseId)?.Name ?? "Unknown",
                Gender = student.Gender,
                PhoneNumber = student.PhoneNumber,
                Guardian = student.Guardian,
                NumberOfViolations = student.Violations?.Count ?? 0,
                Violations = student.Violations
            }).ToList();
        }

        public async Task<Student> GetAsync(string studno)
        {
            var student = await _studentCollection.Find(x => x.StudentNumber == studno).FirstOrDefaultAsync();
            if (student == null) return null;

            var college = await _collegeCollection.Find(c => c.Id == student.CollegeId).FirstOrDefaultAsync();
            var year = await _yearCollection.Find(y => y.Id == student.YearId).FirstOrDefaultAsync();
            var course = await _courseCollection.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();

            return new Student
            {
                Id = student.Id,
                StudentNumber = student.StudentNumber,
                FirstName = student.FirstName,
                LastName = student.LastName,
                MiddleName = student.MiddleName,
                CollegeId = college?.Name ?? "Unknown",
                YearId = year?.Name ?? "Unknown",
                CourseId = course?.Name ?? "Unknown",
                Gender = student.Gender,
                PhoneNumber = student.PhoneNumber,
                Guardian = student.Guardian,
                NumberOfViolations = student.Violations?.Count ?? 0,
                Violations = student.Violations
            };
        }

        public async Task CreateAsync(Student newStudent)
        {
            var collegeExists = await _collegeCollection.Find(c => c.Id == newStudent.CollegeId).AnyAsync();
            var yearExists = await _yearCollection.Find(y => y.Id == newStudent.YearId).AnyAsync();
            var courseExists = await _courseCollection.Find(c => c.Id == newStudent.CourseId).AnyAsync();

            if (!collegeExists || !yearExists || !courseExists)
            {
                throw new Exception("Invalid College, Year, or Course reference");
            }

            if (_studentCollection == null)
            {
                throw new InvalidOperationException("MongoDB collection is not initialized.");
            }

            newStudent.Violations = new List<Violation>();
            await _studentCollection.InsertOneAsync(newStudent);
        }

        public async Task AddViolationAsync(string studno, Violation newViolation)
        {
            var filter = Builders<Student>.Filter.Eq(x => x.StudentNumber, studno);
            newViolation.RecordId = ObjectId.GenerateNewId().ToString(); // Ensure new unique ID
            var update = Builders<Student>.Update
                .Push(x => x.Violations, newViolation)
                .Inc(x => x.NumberOfViolations, 1);

            try
            {
                var result = await _studentCollection.UpdateOneAsync(filter, update);
                if (result.ModifiedCount == 0)
                {
                    throw new Exception($"Failed to add violation for student '{studno}'.");
                }
            }
            catch (MongoException ex)
            {
                throw new Exception("Database Error: Failed to add violation", ex);
            }
        }

        //UPDATE student details
        public async Task UpdateAsync(string id, Student updateStudent)
        {
            var objectId = new ObjectId(id);
            await _studentCollection.ReplaceOneAsync(x => x.Id == id, updateStudent);
        }


        public async Task<List<Student>> GetStudentsByCollegeAsync(string collegeId)
        {
            var students = await _studentCollection.Find(s => s.CollegeId == collegeId).ToListAsync();
            var college = await _collegeCollection.Find(c => c.Id == collegeId).FirstOrDefaultAsync();
            var years = await _yearCollection.Find(_ => true).ToListAsync();
            var courses = await _courseCollection.Find(_ => true).ToListAsync();

            return students.Select(student => new Student
            {
                Id = student.Id,
                StudentNumber = student.StudentNumber,
                FirstName = student.FirstName,
                LastName = student.LastName,
                MiddleName = student.MiddleName,
                CollegeId = college?.Name ?? "Unknown",
                YearId = years.FirstOrDefault(y => y.Id == student.YearId)?.Name ?? "Unknown",
                CourseId = courses.FirstOrDefault(c => c.Id == student.CourseId)?.Name ?? "Unknown",
                Gender = student.Gender,
                PhoneNumber = student.PhoneNumber,
                Guardian = student.Guardian,
                NumberOfViolations = student.Violations?.Count ?? 0,
                Violations = student.Violations
            }).ToList();
        }

        public async Task<bool> AcknowledgeViolationAsync(string violationId)
        {
            var filter = Builders<Student>.Filter.ElemMatch(s => s.Violations, v => v.ViolationId == violationId);
            var update = Builders<Student>.Update.Set("violations.$.acknowledged", true);

            var result = await _studentCollection.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }
    }
}
