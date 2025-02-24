using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WebAPI.Models
{
    public class GuardReports
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)] // Converts ObjectId to a string automatically
        public string Id { get; set; }
        public string studentNumber { get; set; }
        public string email { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string middleName { get; set; }
        public string yearId { get; set; }
        public string collegeId { get; set; }
        public string courseId { get; set; }
        public string gender { get; set; }
        public string phoneNumber { get; set; }
        public string guardian { get; set; }
        public string status { get; set; }
        public bool IsIDInPossession { get; set; }
        public DateTime submissionDate { get; set; }
        public string guardName { get; set; }
        public bool isViewed { get; set; }
        public bool isPassed { get; set; }
        public bool isExisting { get; set; }
        public string violation { get; set; }
        public string remarks { get; set; }
    }
}
