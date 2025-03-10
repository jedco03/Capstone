﻿using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace WebAPI.Models
{
    public class User
    {
        [BsonRepresentation(BsonType.ObjectId)] 
        public string Id { get; set; } = string.Empty;
        [BsonElement("username")]
        public string username { get; set; }
        [BsonElement("password")]
        public string PasswordHash { get; set; }
        [BsonElement("role")]
        public string role { get; set; }
        [BsonElement("name")]
        public string Name { get; set; }
        [BsonElement("email")]
        public string Email { get; set; }
        [BsonElement("college")]
        public string college { get; set; }

    }
}
