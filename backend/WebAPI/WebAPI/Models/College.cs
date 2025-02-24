using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebAPI.Models
{
    public class College
    {
        [BsonId]
        public string Id { get; set; }

        [BsonElement("code")]
        public string Code { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }
    }
}
