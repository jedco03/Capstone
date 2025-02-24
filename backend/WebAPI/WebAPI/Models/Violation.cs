using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WebAPI.Models
{
    public class ViolationType
    {
        [BsonId]
        [BsonElement("_id")]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("type")]
        public string Type { get; set; } 
    }
}
