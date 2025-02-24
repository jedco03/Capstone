using WebAPI.Data;
using WebAPI.Services;
using WebAPI.Authorization;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
using WebAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configure MongoDB settings from appsettings.json
builder.Services.Configure<DatabaseSettings>(builder.Configuration.GetSection("ConnectionStrings"));

// Register MongoDB Client as a Singleton service
builder.Services.AddSingleton<IMongoClient>(sp =>
    new MongoClient(builder.Configuration.GetValue<string>("ConnectionStrings:Connection"))
);

// Register MongoDB collection for GuardReports as a Singleton service
builder.Services.AddSingleton(sp =>
{
    var databaseSettings = sp.GetRequiredService<IOptions<DatabaseSettings>>().Value;
    var mongoClient = sp.GetRequiredService<IMongoClient>();
    var database = mongoClient.GetDatabase(databaseSettings.DatabaseName);
    return database.GetCollection<GuardReports>("GuardReports");  // Adjust to your collection name
});

// Register other services
builder.Services.AddSingleton<StudentServices>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddSingleton<CollegeService>();
builder.Services.AddSingleton<YearService>();
builder.Services.AddSingleton<CourseService>();
builder.Services.AddSingleton<ViolationService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Add Authorization policy for Dean access
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("DeanAccess", policy =>
        policy.RequireAuthenticatedUser()
              .RequireRole("dean")
              .AddRequirements(new DeanAccessRequirement())); // Your custom requirement
});

var app = builder.Build();

// Enable CORS for the specified origin
app.UseCors("AllowSpecificOrigin");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
