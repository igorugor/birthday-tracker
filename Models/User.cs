namespace BirthdayTracker.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public long BirthDay { get; set; }
    public string? ImageUrl { get; set; } = null;
}
