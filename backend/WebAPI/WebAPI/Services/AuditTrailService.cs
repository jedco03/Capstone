using Microsoft.Extensions.Options;
using MongoDB.Driver;
using WebAPI.Data;

public class AuditTrailService
{
    private readonly IMongoCollection<AuditTrail> _auditTrailCollection;

    public AuditTrailService(IOptions<DatabaseSettings> settings)
    {
        var mongoClient = new MongoClient(settings.Value.Connection);
        var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _auditTrailCollection = mongoDb.GetCollection<AuditTrail>("auditTrails");
    }

    public async Task LogActionAsync(string action, string userId, string userName, string recordId, string studentNumber, string details)
    {
        var auditTrailEntry = new AuditTrail
        {
            Action = action,
            UserId = userId,
            UserName = userName,
            RecordId = recordId,
            StudentNumber = studentNumber,
            Timestamp = DateTime.UtcNow,
            Details = details
        };

        await _auditTrailCollection.InsertOneAsync(auditTrailEntry);
    }

    public async Task<List<AuditTrail>> GetAuditTrailsAsync(string action = null)
    {
        var filter = action == null
            ? Builders<AuditTrail>.Filter.Empty
            : Builders<AuditTrail>.Filter.Eq(audit => audit.Action, action);

        return await _auditTrailCollection
            .Find(filter)
            .SortByDescending(audit => audit.Timestamp)
            .ToListAsync();
    }
}