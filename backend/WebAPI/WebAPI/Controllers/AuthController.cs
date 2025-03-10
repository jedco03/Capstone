using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Services;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using Amazon.Runtime.Internal;

namespace WebAPI.Controllers
{
    [Route("api/auth")] // Route prefix 
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IConfiguration _config;
        private readonly AuditTrailService _auditTrailService;

        public AuthController(AuthService authService, IConfiguration config, AuditTrailService auditTrailService)
        {
            _authService = authService;
            _config = config;
            _auditTrailService = auditTrailService;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] UserCredentials credentials)
        {
            try
            {
                var user = await _authService.GetUserByUsernameAsync(credentials.Username);
                Console.WriteLine($"Login request received for user: {credentials.Username}"); // Debugging

                if (user == null || !VerifyPasswordHash(credentials.Password, user.PasswordHash))
                {
                    Console.WriteLine("Invalid username or password"); // Debugging
                    return Unauthorized();
                }

                // Use the GenerateJwtToken method
                var token = GenerateJwtToken(user);

                var response = new
                {
                    message = "Authentication Successful",
                    token = token,
                    userId = user.Id,
                    role = user.role,
                    username = user.username,
                    name = user.Name,
                    email = user.Email,
                    college = user.college
                };

                await _auditTrailService.LogActionAsync(
                    "Log In",
                    user.Id.ToString(),
                    user.Name,
                    null,
                    null,
                    "User logged in successfully."
                );

                Response.Headers.Add("Access-Control-Allow-Origin", "http://localhost:3000");
                Response.Headers.Add("Access-Control-Allow-Credentials", "true");

                Console.WriteLine($"Token generated for user: {user.username}"); // Debugging
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error during authentication: {ex}"); // Debugging
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }



        // NEW: Generate JWT Token
        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // User ID
                new Claim("fullName", user.Name), // ✅ Store full name in a separate claim
                new Claim(ClaimTypes.Name, user.username), // Store username here
                new Claim(ClaimTypes.Role, user.role), // Role
                new Claim("college", user.college ?? "") // College
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

        private bool VerifyPasswordHash(string providedPassword, string storedPasswordHash)
        {
            return BCrypt.Net.BCrypt.Verify(providedPassword, storedPasswordHash);
        }


        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            if (users == null || users.Count == 0)
            {
                return NotFound("No users found.");
            }
            return Ok(users);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User newUser)
        {
            // Check if user already exists
            var existingUser = await _authService.GetUserByUsernameAsync(newUser.username);
            if (existingUser != null)
            {
                return Conflict("Username already exists.");
            }

            // Store user in database
            await _authService.CreateUserAsync(newUser);

            // Log the audit trail
            var user = HttpContext.User;
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
            var userFullName = user.FindFirst("fullName")?.Value; // Extract Full Name

            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(userFullName))
            {
                var auditTrailDescription = $"A {newUser.role} account has been created by {userFullName} for {newUser.Name}.";

                await _auditTrailService.LogActionAsync(
                    "Create Account", // Action
                    userId, // User ID
                    userFullName, // User Full Name
                    null, // Record ID
                    null, // Student Number (not applicable for accounts)
                    auditTrailDescription // Details
                );
            }

            return CreatedAtAction(nameof(Register), new { username = newUser.username }, newUser);
        }

        [HttpPost("hash")]
        public IActionResult HashPassword([FromBody] JsonElement request)
        {
            if (!request.TryGetProperty("password", out JsonElement passwordElement) || passwordElement.ValueKind != JsonValueKind.String)
            {
                return BadRequest("Password is required and must be a string.");
            }

            string password = passwordElement.GetString();
            if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            {
                return BadRequest("Password must be at least 8 characters long.");
            }

            if (!Regex.IsMatch(password, @"[!@#$%^&*]"))
            {
                return BadRequest("Password must contain at least one special character.");
            }

            string hashedPassword = _authService.HashPassword(password);
            return Ok(hashedPassword);
        }

        [HttpPut("change-password/{username}")]
        public async Task<IActionResult> ChangePassword(string username, [FromBody] ChangePasswordRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(request.NewPassword))
                {
                    return BadRequest("Username and new password are required.");
                }

                // Find the user by username
                var user = await _authService.GetUserByUsernameAsync(username);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                // Hash the new password
                string hashedPassword = _authService.HashPassword(request.NewPassword);

                // Update the user's password
                var updateResult = await _authService.UpdateUserPasswordAsync(username, hashedPassword);

                if (updateResult)
                {
                    // Log the audit trail
                    var currentUser = HttpContext.User;
                    var userId = currentUser.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
                    var userFullName = currentUser.FindFirst("fullName")?.Value; // Extract Full Name

                    if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(userFullName))
                    {
                        var auditTrailDescription = $"Password for account {username} was changed by {userFullName}.";

                        await _auditTrailService.LogActionAsync(
                            "Change Password", // Action
                            userId, // User ID
                            userFullName, // User Full Name
                            null,
                            null, 
                            auditTrailDescription // Details
                        );
                    }

                    return Ok("Password changed successfully.");
                }
                else
                {
                    return StatusCode(500, "Failed to update password.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpDelete("delete/{username}")]
        public async Task<IActionResult> DeleteAccount(string username)
        {
            try
            {
                // Find the user by username
                var user = await _authService.GetUserByUsernameAsync(username);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                // Delete the user account
                var deleted = await _authService.DeleteUserAsync(username);
                if (deleted)
                {
                    // Log the audit trail
                    var currentUser = HttpContext.User;
                    var userId = currentUser.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Extract User ID
                    var userFullName = currentUser.FindFirst("fullName")?.Value; // Extract Full Name

                    if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(userFullName))
                    {
                        var auditTrailDescription = $"Account {username} was deleted by {userFullName}.";

                        await _auditTrailService.LogActionAsync(
                            "Delete Account", // Action
                            userId, // User ID
                            userFullName, // User Full Name
                            null, 
                            null, 
                            auditTrailDescription // Details
                        );
                    }

                    return Ok("Account deleted successfully.");
                }
                else
                {
                    return StatusCode(500, "An error occurred while deleting the account.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }


        public class ChangePasswordRequest
        {
            public string NewPassword { get; set; }
        }

    }

}