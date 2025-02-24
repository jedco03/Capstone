using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace YourNamespace.Models
{
    public class Course
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)] // Ensuring _id is treated as a string (course code)
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("college")]
        public string College { get; set; }
    }
}
