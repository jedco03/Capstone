using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebAPI.Models
{
    public class Year
    {
        [BsonId]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }
    }
}
