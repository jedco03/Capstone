using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebAPI.Controllers;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _logger;
        public TokenService(IConfiguration config, ILogger<AuthController> logger)
        {
            _config = config;
            _logger = logger;
        }

        public string GenerateToken(User user)
        {


            // 1. Create Security Claims
            var claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, user.username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique identifier
            new Claim(ClaimTypes.Role, user.role),
            new Claim("college", user.college) // Include the college claim
    };

            // 2. Create Security Key
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 3. Create the JWT Token
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(30), // Example expiration time
                signingCredentials: creds
            );

            Console.WriteLine("Generated Token: " + new JwtSecurityTokenHandler().WriteToken(token));
            // 4. Return the Serialized Token

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
