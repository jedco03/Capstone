using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/auth")] // Route prefix 
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService; // Inject the AuthService

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] UserCredentials credentials)
        {
            var user = await _authService.GetUserByUsernameAsync(credentials.Username);

            
            if (user == null)
            {

                return NotFound();
            }
            if (!VerifyPasswordHash(credentials.Password, user.PasswordHash)) // Replace with your password verification function
            {
                return Unauthorized();
            }

            // Generate JWT upon successful authentication
            return Ok(new { message = "Authentication Successful" });
        }
        private bool VerifyPasswordHash(string providedPassword, string storedPasswordHash)
        {
            // Extract salt with version and work factor (adjust regex if needed)
            string salt = storedPasswordHash.Substring(0, 29);

            // Reconstruct hash using the extracted salt
            string newHash = BCrypt.Net.BCrypt.HashPassword(providedPassword, salt);

            // Compare the newly generated hash with the stored one
            return newHash == storedPasswordHash;
        }
    }
}
