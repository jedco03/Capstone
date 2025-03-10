using WebAPI.Data;
using WebAPI.Services;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
using WebAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Configure MongoDB settings
builder.Services.Configure<DatabaseSettings>(
    builder.Configuration.GetSection("ConnectionStrings")
);

builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetValue<string>("ConnectionStrings:Connection"))
);

builder.Services.AddSingleton(sp =>
{
    var databaseSettings = sp.GetRequiredService<IOptions<DatabaseSettings>>().Value;
    var mongoClient = sp.GetRequiredService<IMongoClient>();
    var database = mongoClient.GetDatabase(databaseSettings.DatabaseName);
    return database.GetCollection<GuardReports>("GuardReports");
});

// Register services
builder.Services.AddSingleton<StudentServices>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddSingleton<CollegeService>();
builder.Services.AddSingleton<YearService>();
builder.Services.AddSingleton<CourseService>();
builder.Services.AddSingleton<ViolationService>();
builder.Services.AddSingleton<AuditTrailService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers();

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// **Fix: Get JWT Key Properly**
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings.GetValue<string>("Key");

if (string.IsNullOrEmpty(secretKey))
{
    throw new ArgumentNullException("Jwt:Key", "JWT secret key is missing in appsettings.json.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true, // Set to true if using Issuer
            ValidIssuer = "localhost", // Match the token's issuer
            ValidateAudience = true, // Set to true if using Audience
            ValidAudience = "localhost", // Match the token's audience
            ValidateLifetime = true,
            RoleClaimType = ClaimTypes.Role 
        };
    });


// Authorization Policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("DeanAccess", policy =>
        policy.RequireAuthenticatedUser()
              .RequireRole("Dean"));
});

var app = builder.Build();

// **Fix: Remove Duplicate `UseCors()`**
app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// **Correct Order of Middlewares**
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
