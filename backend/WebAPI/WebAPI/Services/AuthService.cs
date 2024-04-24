using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using WebAPI.Data;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class AuthService
    {
        private readonly IMongoCollection<User> _usersCollection;

        public AuthService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _usersCollection = mongoDb.GetCollection<User>("users"); 
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _usersCollection.Find(Builders<User>.Filter.Regex("username", new BsonRegularExpression(username, "i"))).FirstOrDefaultAsync();
        }
    }
}
