using Microsoft.Extensions.Options;
using MongoDB.Driver;
using WebAPI.Models;
using WebAPI.Data;

namespace WebAPI.Services
{
    public class ViolationService
    {
        private readonly IMongoCollection<ViolationType> _violationCollection;

        public ViolationService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _violationCollection = mongoDb.GetCollection<ViolationType>("violationColl");
        }

        public async Task<List<ViolationType>> GetAllViolationsAsync()
        {
            return await _violationCollection.Find(_ => true).ToListAsync();
        }

        public async Task<ViolationType> GetViolationByIdAsync(string id)
        {
            return await _violationCollection.Find(v => v.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateViolationAsync(ViolationType violation)
        {
            await _violationCollection.InsertOneAsync(violation);
        }

        public async Task UpdateViolationAsync(string id, ViolationType updatedViolation)
        {
            var filter = Builders<ViolationType>.Filter.Eq(v => v.Id, id);

            // Ensure `_id` is not being changed
            updatedViolation.Id = id; // Assign existing ID
            var updateDefinition = Builders<ViolationType>.Update
                .Set(v => v.Name, updatedViolation.Name)
                .Set(v => v.Type, updatedViolation.Type); // Add other fields as needed

            await _violationCollection.UpdateOneAsync(filter, updateDefinition);
        }

        public async Task DeleteViolationAsync(string id)
        {
            await _violationCollection.DeleteOneAsync(v => v.Id == id);
        }
    }
}
