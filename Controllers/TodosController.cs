using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BirthdayTracker.Models;
using BirthdayTracker.Database;

namespace BirthdayTracker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TodosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Todo>>> GetTodos()
        {
            return await _context.Todos.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Todo>> GetTodo(int id)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }

            return todo;
        }

        [HttpPost]
        public async Task<ActionResult<Todo>> CreateTodo(Todo todo)
        {
            if (todo.Title.Length == 0)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { message = "Title must not be empty" });
            }
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();

            return todo;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateTodo(int id, Todo todo)
        {
            if (id != todo.Id) return BadRequest();

            if (todo.Title.Length == 0)
            {
                return StatusCode(StatusCodes.Status400BadRequest, new { message = "Title must not be empty" });
            }
            _context.Entry(todo).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTodo(int id)
        {
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null) return NotFound();

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
