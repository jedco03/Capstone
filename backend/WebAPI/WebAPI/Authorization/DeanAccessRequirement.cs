using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using WebAPI.Authorization;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Authorization
{
    public class DeanAccessRequirement : IAuthorizationRequirement
    {
    }

    public class DeanAccessRequirementHandler : AuthorizationHandler<DeanAccessRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly StudentServices _studentServices; 

        public DeanAccessRequirementHandler(IHttpContextAccessor httpContextAccessor, StudentServices studentServices)
        {
            _httpContextAccessor = httpContextAccessor;
            _studentServices = studentServices;
        }


        // Authorize If Dean's College is Known (For fetching all students)
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, DeanAccessRequirement requirement)
        {
            
            var deanCollege = _httpContextAccessor.HttpContext.User.FindFirst("College")?.Value;

            if (deanCollege is not null)
            {
                context.Succeed(requirement);
            }
        }
    }
}
