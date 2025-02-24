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
}
