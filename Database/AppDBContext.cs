using Microsoft.EntityFrameworkCore;
using BirthdayTracker.Models;

namespace BirthdayTracker.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Todo> Todos { get; set; }
    public DbSet<User> Users { get; set; }
}
