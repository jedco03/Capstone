using WebAPI.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Data;
using WebAPI.Models;
using Microsoft.Extensions.Options;

namespace WebAPI.Services
{
    public class YearService
    {
        private readonly IMongoCollection<Year> _yearsCollection;

        public YearService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _yearsCollection = mongoDb.GetCollection<Year>("yearColl");
        }

        public async Task<List<Year>> GetAllYearsAsync()
        {
            return await _yearsCollection.Find(year => true).ToListAsync();
        }

        public async Task<Year> GetYearByIdAsync(string id)
        {
            return await _yearsCollection.Find(year => year.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateYearAsync(Year year)
        {
            await _yearsCollection.InsertOneAsync(year);
        }

        public async Task UpdateYearAsync(string id, Year updatedYear)
        {
            await _yearsCollection.ReplaceOneAsync(year => year.Id == id, updatedYear);
        }

        public async Task DeleteYearAsync(string id)
        {
            await _yearsCollection.DeleteOneAsync(year => year.Id == id);
        }
    }
}
