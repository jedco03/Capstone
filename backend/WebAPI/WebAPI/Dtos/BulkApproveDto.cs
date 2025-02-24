using WebAPI.Models;

namespace WebAPI.Dtos
{
    public class BulkApproveDto
    {
        public List<GuardReports> Reports { get; set; } // List of full reports to process
    }
}
