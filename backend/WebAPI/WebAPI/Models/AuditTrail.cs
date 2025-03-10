using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

public class AuditTrail
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    [BsonElement("action")]
    public string Action { get; set; } // e.g., "Login", "Add Record", "Edit Record"

    [BsonElement("userId")]
    public string UserId { get; set; } // ID of the user who performed the action

    [BsonElement("userName")]
    public string UserName { get; set; } // Name of the user who performed the action

    [BsonElement("recordId")]
    public string RecordId { get; set; } // ID of the record that was affected
    [BsonElement("studentNumber")]
    public string StudentNumber { get; set; }

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } // When the action was performed

    [BsonElement("details")]
    public string Details { get; set; } // Additional details about the action
}