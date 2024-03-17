using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebAPI.Models { 

    [BsonIgnoreExtraElements]
    public class Student
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("studno")]
        public string StudentNumber { get; set; } = "Student Number";

        [BsonElement("fname")]
        public string FirstName { get; set; } = "Student First Name";

        [BsonElement("lname")]
        public string LastName { get; set; } = "Student Last Name";

        [BsonElement("mname")]
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

        [BsonElement("violation")]
        public string Violation { get; set; } = "Violation";

        [BsonElement("type")]
        public string Type { get; set; } = "Type of Violation";

        [BsonElement("status")]
        public string Status { get; set; } = "Status";

        /*[BsonElement("date")]
        public string Date { get; set; } */


        [BsonElement("remarks")]
        public string Remarks { get; set; } = "Remarks";

    }
}
