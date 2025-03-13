using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WebAPI.Models
{
    public class Semester
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)] // Ensure MongoDB handles the ID
        public string Id { get; set; } // Optional: MongoDB will generate this

        [BsonElement("semesterId")]
        public string SemesterId { get; set; }

        [BsonElement("academicYear")]
        public string AcademicYear { get; set; } 

        [BsonElement("semesterName")]
        public string SemesterName { get; set; } 

        [BsonElement("startDate")]
        public DateTime StartDate { get; set; } 

        [BsonElement("endDate")]
        public DateTime EndDate { get; set; }
    }
}