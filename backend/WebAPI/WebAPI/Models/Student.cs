using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebAPI.Models { 

    [BsonIgnoreExtraElements]
    public class Student
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("studentNumber")]
        public string StudentNumber { get; set; } = "Student Number";

        [BsonElement("firstName")]
        public string FirstName { get; set; } = "Student First Name";

        [BsonElement("lastName")]
        public string LastName { get; set; } = "Student Last Name";

        [BsonElement("middleName")]
        public string MiddleName { get; set; } = "Student Middle Name";

        [BsonElement("year")]
        public int Year { get; set; } = 1;

        [BsonElement("college")]
        public string College { get; set; } = "Department";

        [BsonElement("gender")]
        public string Gender { get; set; } = "Gender";

        [BsonElement("phoneno")]
        public string PhoneNumber { get; set; } = "Phone Number";

        [BsonElement("guardian")]
        public string Guardian { get; set; } = "Guardian Name";

        public int NumberOfViolations { get; set; } = 0;

        [BsonElement("violations")]
        public List<Violation> Violations { get; set; } = new List<Violation>();

    }

    public class Violation
    {
        public string violation { get; set; }
        public string type { get; set; }
        public string status { get; set; }
        public string remarks { get; set; }
    }
}
