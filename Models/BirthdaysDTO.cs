using BirthdayTracker.Models;

namespace BirthdayTracker.Models;

public class BirthdaysDTO
{
    public required UserDTO[] OnFromDate { get; set; }
    public required UserDTO[] BeforeToDate { get; set; }
}
