using RestSharp;

public class BrevoEmailService
{
    private readonly string _apiKey;
    private readonly string _senderEmail;
    private readonly string _senderName;

    public BrevoEmailService(string apiKey, string senderEmail, string senderName)
    {
        _apiKey = apiKey;
        _senderEmail = senderEmail;
        _senderName = senderName;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlContent)
    {
        var client = new RestClient("https://api.brevo.com/v3/smtp/email");
        var request = new RestRequest
        {
            Method = Method.Post
        };
        request.AddHeader("api-key", _apiKey); // Add the API key to the headers
        request.AddHeader("Content-Type", "application/json"); // Ensure the content type is set
        request.AddJsonBody(new
        {
            sender = new { email = _senderEmail, name = _senderName },
            to = new[] { new { email = toEmail, name = toName } },
            subject,
            htmlContent
        });

        var response = await client.ExecuteAsync(request);

        if (!response.IsSuccessful)
        {
            throw new Exception($"Failed to send email: {response.Content}");
        }
    }
}