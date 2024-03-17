using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebAPI.Models
{
    public class User
    {
        public ObjectId Id { get; set; }
        [BsonElement("username")]
        public string username { get; set; }
        [BsonElement("password")]
        public string PasswordHash { get; set; }
    }
}
