using Microsoft.AspNetCore.Mvc;
using BirthdayTracker.Models;
using BirthdayTracker.Database;

namespace BirthdayTracker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(AppDbContext context) : ControllerBase
    {
        private readonly AppDbContext _context = context;

        private static void DeleteImageFile(string? imagePath)
        {
            if (string.IsNullOrEmpty(imagePath)) return;

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", imagePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers(string? fromDate, string? toDate, int page = 1, int pageSize = 10)
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

            var usersWithBirthdayOnFromDate = _context.Users.AsEnumerable().Where(u =>
            {
                var birthDateUtc = DateTimeOffset.FromUnixTimeSeconds(u.BirthDay).UtcDateTime;
                int birthMonthDay = birthDateUtc.Month * 100 + birthDateUtc.Day;

                return birthMonthDay == fromMonthDay;
            }).Select(u => new UserDTO
            {
                Id = u.Id,
                Name = u.Name,
                BirthDay = DateTimeOffset.FromUnixTimeSeconds(u.BirthDay).UtcDateTime,
                ImageUrl = u.ImageUrl != null ? $"{$"{Request.Scheme}://{Request.Host}"}/{u.ImageUrl}" : null
                }).OrderBy(u => u.BirthDay).Skip((page - 1) * pageSize).Take(pageSize)
                .ToArray();

            var usersWithBirthdayOnToDate = _context.Users
                .AsEnumerable()
                .Where(u =>
                {
                    var birthDateUtc = DateTimeOffset.FromUnixTimeSeconds(u.BirthDay).UtcDateTime;
                    int birthMonthDay = birthDateUtc.Month * 100 + birthDateUtc.Day;

                    return fromMonthDay <= toMonthDay
                        ? (birthMonthDay > fromMonthDay && birthMonthDay <= toMonthDay)
                        : (birthMonthDay > fromMonthDay || birthMonthDay <= toMonthDay);
                })
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    BirthDay = DateTimeOffset.FromUnixTimeSeconds(u.BirthDay).UtcDateTime,
                    ImageUrl = u.ImageUrl != null ? $"{$"{Request.Scheme}://{Request.Host}"}/{u.ImageUrl}" : null
                }).OrderBy(u => u.BirthDay).Skip((page - 1) * pageSize).Take(pageSize)
                .ToArray();

            return Ok(new BirthdaysDTO
            {
                OnFromDate = usersWithBirthdayOnFromDate,
                BeforeToDate = usersWithBirthdayOnToDate
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetTodo(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new {message = "User not found"});
            }

            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                BirthDay = DateTimeOffset.FromUnixTimeSeconds(user.BirthDay).UtcDateTime,
                ImageUrl = user.ImageUrl != null ? $"{$"{Request.Scheme}://{Request.Host}"}/{user.ImageUrl}" : null
            };
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromForm] UserFormData userData)
        {
            if (userData.Name.Length == 0)
            {
                return BadRequest(new { message = "Name must not be empty" });
            }

            if (userData.BirthDay == null || userData.BirthDay == default)
            {
                return BadRequest(new { message = "BirthDay is required and must be a valid ISO 8601 date" });
            }

            if (userData.BirthDay > DateTime.UtcNow)
            {
                return BadRequest(new { message = "BirthDay cannot be in the future" });
            }

            long birthDayUnix = ((DateTimeOffset)userData.BirthDay.ToUniversalTime()).ToUnixTimeSeconds();

            var user = new User
            {
                Name = userData.Name,
                BirthDay = birthDayUnix,
            };

            if (userData.Image != null && userData.Image.Length > 0)
            {
                string fileName = $"{Guid.NewGuid()}{Path.GetExtension(userData.Image.FileName)}";
                string path = Path.Combine("wwwroot/images/users", fileName);

                Directory.CreateDirectory("wwwroot/images/users");

                using var stream = new FileStream(path, FileMode.Create);
                await userData.Image.CopyToAsync(stream);

                user.ImageUrl = $"images/users/{fileName}";
            }

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser([FromForm] UserFormData userData)
        {
            var existingUser = await _context.Users.FindAsync(userData.Id);
            if (existingUser == null)
            {
                return NotFound(new {message = "User not found"});
            }

            if (userData.Name.Length == 0)
            {
                return BadRequest(new { message = "Name must not be empty" });
            }

            if (userData.BirthDay == null || userData.BirthDay == default)
            {
                return BadRequest(new { message = "BirthDay is required and must be a valid ISO 8601 date" });
            }

            if (userData.BirthDay > DateTime.UtcNow)
            {
                return BadRequest(new { message = "BirthDay cannot be in the future" });
            }

            existingUser.Name = userData.Name;
            existingUser.BirthDay = ((DateTimeOffset)userData.BirthDay.ToUniversalTime()).ToUnixTimeSeconds();

            if (userData.Image != null && userData.Image.Length > 0)
            {
                string fileName = $"{Guid.NewGuid()}{Path.GetExtension(userData.Image.FileName)}";
                string path = Path.Combine("wwwroot/images/users", fileName);

                Directory.CreateDirectory("wwwroot/images/users");

                using var stream = new FileStream(path, FileMode.Create);
                await userData.Image.CopyToAsync(stream);

                DeleteImageFile(existingUser.ImageUrl);

                existingUser.ImageUrl = $"images/users/{fileName}";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new {message = "User not found"});

            if (user.ImageUrl != null) {
                DeleteImageFile(user.ImageUrl);
            }
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
