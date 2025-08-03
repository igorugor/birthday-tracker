using System;

namespace BirthdayTracker.Models;

public class UserFormData
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime BirthDay { get; set; }
    public IFormFile? Image { get; set; }
}
