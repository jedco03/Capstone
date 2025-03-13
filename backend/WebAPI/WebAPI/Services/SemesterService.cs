using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Data;
using WebAPI.Models;

public class SemesterService
{
    private readonly IMongoCollection<Semester> _semesterCollection;

    public SemesterService(IOptions<DatabaseSettings> settings)
    {
        var mongoClient = new MongoClient(settings.Value.Connection);
        var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _semesterCollection = mongoDb.GetCollection<Semester>("semesterColl");
    }

    // Get all semesters
    public async Task<List<Semester>> GetAllSemestersAsync()
    {
        return await _semesterCollection.Find(_ => true).ToListAsync();
    }

    // Get a semester by ID
    public async Task<Semester> GetSemesterByIdAsync(string id)
    {
        return await _semesterCollection.Find(s => s.Id == id).FirstOrDefaultAsync();
    }

    // Get semester by date
    public async Task<Semester> GetActiveSemesterAsync(DateTime date)
    {
        // Fetch the semester where the date falls within the start and end dates
        var filter = Builders<Semester>.Filter.And(
            Builders<Semester>.Filter.Lte(s => s.StartDate, date),
            Builders<Semester>.Filter.Gte(s => s.EndDate, date)
        );

        var semester = await _semesterCollection.Find(filter).FirstOrDefaultAsync();
        return semester;
    }

    // Add a new semester
    public async Task CreateSemesterAsync(Semester semester)
    {
        await _semesterCollection.InsertOneAsync(semester);
    }

    // Update an existing semester
    public async Task UpdateSemesterAsync(string id, Semester semester)
    {
        await _semesterCollection.ReplaceOneAsync(s => s.Id == id, semester);
    }

    // Delete a semester
    public async Task DeleteSemesterAsync(string id)
    {
        await _semesterCollection.DeleteOneAsync(s => s.Id == id);
    }

    
}