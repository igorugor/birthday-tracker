using Microsoft.AspNetCore.Mvc;
using BirthdayTracker.Models;
using BirthdayTracker.Database;
using Microsoft.EntityFrameworkCore;

namespace BirthdayTracker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(AppDbContext context) : ControllerBase
    {
        private readonly AppDbContext _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers(string? fromDate, string? toDate)
        {
            DateTime fromDateParam = DateTime.UtcNow.Date;

            if (!string.IsNullOrWhiteSpace(fromDate))
            {
                if (DateTime.TryParseExact(
                    fromDate,
                    "dd-MM",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal,
                    out DateTime fromDateParsed))
                {
                    fromDateParam = new DateTime(DateTime.UtcNow.Year, fromDateParsed.Month, fromDateParsed.Day, 0, 0, 0, DateTimeKind.Utc);
                }
                else
                {
                    return BadRequest(new { message = "From Date must be in format dd-MM" });
                }
            }

            DateTime toDateParam = fromDateParam.AddDays(7);

            if (!string.IsNullOrWhiteSpace(toDate))
            {
                if (DateTime.TryParseExact(
                    toDate,
                    "dd-MM",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal,
                    out DateTime toDateParsed))
                {
                    toDateParam = new DateTime(DateTime.UtcNow.Year, toDateParsed.Month, toDateParsed.Day, 0, 0, 0, DateTimeKind.Utc);
                }
                else
                {
                    return BadRequest(new { message = "To Date must be in format dd-MM" });
                }
            }

            int fromMonthDay = fromDateParam.Month * 100 + fromDateParam.Day;
            int toMonthDay = toDateParam.Month * 100 + toDateParam.Day;


            var users = _context.Users
                .AsEnumerable()
                .Where(u =>
                {
                    var birthDateUtc = DateTimeOffset.FromUnixTimeSeconds(u.BirthDay).UtcDateTime;
                    int birthMonthDay = birthDateUtc.Month * 100 + birthDateUtc.Day;

                    return fromMonthDay <= toMonthDay
                        ? (birthMonthDay >= fromMonthDay && birthMonthDay <= toMonthDay)
                        : (birthMonthDay >= fromMonthDay || birthMonthDay <= toMonthDay);
                })
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    BirthDay = DateTimeOffset.FromUnixTimeSeconds(u.BirthDay).UtcDateTime
                })
                .ToArray();

            return Ok(users);
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(UserDTO userDto)
        {
            if (userDto.Name.Length == 0)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { message = "Name must not be empty" });
            }

            if (userDto.BirthDay == null || userDto.BirthDay == default)
            {
                return BadRequest(new { message = "BirthDay is required and must be a valid ISO 8601 date" });
            }

            if (userDto.BirthDay > DateTime.UtcNow)
            {
                return BadRequest(new { message = "BirthDay cannot be in the future" });
            }

            long birthDayUnix = ((DateTimeOffset)userDto.BirthDay.ToUniversalTime()).ToUnixTimeSeconds();

            var user = new User
            {
                Name = userDto.Name,
                BirthDay = birthDayUnix,
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(int id, UserDTO userDto)
        {
            if (id != userDto.Id )
            {
                return BadRequest();
            }

            if (userDto.Name.Length == 0)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { message = "Name must not be empty" });
            }

            if (userDto.BirthDay == null || userDto.BirthDay == default)
            {
                return BadRequest(new { message = "BirthDay is required and must be a valid ISO 8601 date" });
            }

            if (userDto.BirthDay > DateTime.UtcNow)
            {
                return BadRequest(new { message = "BirthDay cannot be in the future" });
            }

            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
            {
                return NotFound();
            }

            existingUser.Name = userDto.Name;
            existingUser.BirthDay = ((DateTimeOffset)userDto.BirthDay.ToUniversalTime()).ToUnixTimeSeconds();

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
