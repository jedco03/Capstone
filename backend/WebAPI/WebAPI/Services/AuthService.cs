using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebAPI.Data;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class AuthService
    {
        private readonly IMongoCollection<User> _usersCollection;
        private readonly IConfiguration _config;

        public AuthService(IOptions<DatabaseSettings> settings, IConfiguration config)
        {
            var mongoClient = new MongoClient(settings.Value.Connection);
            var mongoDb = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _usersCollection = mongoDb.GetCollection<User>("users");
            _config = config; // Inject config
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            return await _usersCollection.Find(Builders<User>.Filter.Regex("username", new BsonRegularExpression(username, "i"))).FirstOrDefaultAsync();
        }

        public string HashPassword(string plainTextPassword)
        {
            string salt = BCrypt.Net.BCrypt.GenerateSalt();
            return BCrypt.Net.BCrypt.HashPassword(plainTextPassword, salt);
        }

        // NEW: Generate JWT token for authenticated user
        public string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.username),
                new Claim(ClaimTypes.Role, user.role),
                new Claim("UserId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _usersCollection
                .Find(_ => true)
                .Project(u => new User
                {
                    username = u.username,
                    Name = u.Name,
                    Email = u.Email,
                    role = u.role,
                    college = u.college
                })
                .ToListAsync();
        }

        public async Task CreateUserAsync(User newUser)
        {
            await _usersCollection.InsertOneAsync(newUser);
        }

        public async Task<bool> UpdateUserPasswordAsync(string username, string newHashedPassword)
        {
            var filter = Builders<User>.Filter.Eq(u => u.username, username);
            var update = Builders<User>.Update.Set(u => u.PasswordHash, newHashedPassword);

            var updateResult = await _usersCollection.UpdateOneAsync(filter, update);

            return updateResult.ModifiedCount > 0;
        }

        public async Task<bool> DeleteUserAsync(string username)
        {
            var result = await _usersCollection.DeleteOneAsync(u => u.username == username);
            return result.DeletedCount > 0;
        }

        public async Task<User> GetDeanByCollegeIdAsync(string collegeId)
        {
            var filter = Builders<User>.Filter.And(
                Builders<User>.Filter.Eq(u => u.role, "Dean"),
                Builders<User>.Filter.Eq(u => u.college, collegeId)
            );

            return await _usersCollection.Find(filter).FirstOrDefaultAsync();
        }

    }
}
