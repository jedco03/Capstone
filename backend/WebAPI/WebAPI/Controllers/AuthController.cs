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
            if (!VerifyPasswordHash(credentials.Password, user.PasswordHash)) 
            {
                return Unauthorized();
            }

            var selectedRole = HttpContext.Request.Headers["SelectedRole"].ToString();
            if (string.IsNullOrEmpty(selectedRole) || !string.Equals(selectedRole, user.role, StringComparison.OrdinalIgnoreCase))
            {
                return Forbid("Role mismatch"); // Role doesn't match
            }

            // Authentication successful
            return Ok(new
            {
                message = "Authentication Successful",
                role = user.role,
                username = user.username,
                name = user.Name,
                email = user.Email,
                college = user.college
            });
        }
        private bool VerifyPasswordHash(string providedPassword, string storedPasswordHash)
        {
            // Extract salt with version and work factor
            string salt = storedPasswordHash.Substring(0, 29);

            // Reconstruct hash using the extracted salt
            string newHash = BCrypt.Net.BCrypt.HashPassword(providedPassword, salt);


            // Compare the newly generated hash with the stored one
            return newHash == storedPasswordHash;
        }
    }

}