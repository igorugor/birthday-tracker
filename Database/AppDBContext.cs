using Microsoft.EntityFrameworkCore;
using BirthdayTracker.Models;

namespace BirthdayTracker.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
}
