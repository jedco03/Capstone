using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Data;
using WebAPI.Models;

public class CollegeService
{
    private readonly IMongoCollection<College> _collegeCollection;

    public CollegeService(IOptions<DatabaseSettings> settings)
    {
        var mongoClient = new MongoClient(settings.Value.Connection);
        var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collegeCollection = mongoDb.GetCollection<College>("collegeColl");
    }

    public async Task<List<College>> GetAllCollegesAsync()
    {
        return await _collegeCollection.Find(_ => true).ToListAsync();
    }

    public async Task<College> GetCollegeByIdAsync(string id)
    {
        return await _collegeCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    // Add a new college
    public async Task CreateCollegeAsync(College college)
    {
        await _collegeCollection.InsertOneAsync(college);
    }

    // Update an existing college
    public async Task UpdateCollegeAsync(string id, College college)
    {
        await _collegeCollection.ReplaceOneAsync(c => c.Id == id, college);
    }

    // Delete a college
    public async Task DeleteCollegeAsync(string id)
    {
        await _collegeCollection.DeleteOneAsync(c => c.Id == id);
    }


}
