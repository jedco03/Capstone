using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebAPI.Models
{
    [BsonIgnoreExtraElements]
    public class Student
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("studentNumber")]
        public string StudentNumber { get; set; } = "Student Number";
        [BsonElement("email")]
        public string Email { get; set; } = "Student Email";

        [BsonElement("firstName")]
        public string FirstName { get; set; } = "Student First Name";

        [BsonElement("lastName")]
        public string LastName { get; set; } = "Student Last Name";

        [BsonElement("middleName")]
        public string MiddleName { get; set; } = "Student Middle Name";

        [BsonElement("year")]
        public string YearId { get; set; } = string.Empty;

        [BsonElement("college")]
        public string CollegeId { get; set; } = string.Empty;

        [BsonElement("course")]
        public string CourseId { get; set; } = string.Empty;

        [BsonElement("gender")]
        public string Gender { get; set; } = "Gender";

        [BsonElement("phoneno")]
        public string PhoneNumber { get; set; } = "Phone Number";

        [BsonElement("guardian")]
        public string Guardian { get; set; } = "Guardian Name";

        [BsonElement("numberOfViolations")]
        public int NumberOfViolations { get; set; } = 0;

        [BsonElement("violations")]
        public List<Violation> Violations { get; set; } = new List<Violation>(); 
    }

    public class Violation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string RecordId { get; set; } = ObjectId.GenerateNewId().ToString(); // Unique for each record

        [BsonElement("violationId")]
        public string ViolationId { get; set; } = string.Empty;

        [BsonElement("remarks")]
        public string Remarks { get; set; } = string.Empty;

        [BsonElement("date")]
        public DateTime Date { get; set; } = DateTime.Now;

        [BsonElement("acknowledged")]
        public bool Acknowledged { get; set; } = false;
        [BsonElement("IsIDInPossession")]
        public bool IsIDInPossession { get; set; } = false;
        [BsonElement("guardName")]
        public string guardName { get; set; } = string.Empty;
    }
}
