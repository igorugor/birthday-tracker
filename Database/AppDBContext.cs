using Microsoft.EntityFrameworkCore;
using BirthdayTracker.Models;

namespace BirthdayTracker.Database;

public class AppDbContext: DbContext
{
 public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Todo> Todos { get; set; }
}
