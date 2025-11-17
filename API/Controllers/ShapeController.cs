using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShapeController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;

        public ShapeController(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        [HttpPost]
        public async Task<IActionResult> AddShape(Shape shape)
        {
            _appDbContext.Shapes.Add(shape);
            await _appDbContext.SaveChangesAsync();

            return Ok(shape);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Shape>>> GetAllShapes()
        {
            var shapes = await _appDbContext.Shapes.ToListAsync();

            return Ok(shapes);
        }
        
        [HttpGet ("{id}")]
        public async Task<ActionResult<Shape>> GetShapeById(int id)
        {
            var shape = await _appDbContext.Shapes.FindAsync(id);

            if (shape == null)
            {
                return NotFound("Shape wasn't found.");
            }

            return Ok(shape);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShape(int id, [FromBody] Shape updatedShape)
        {
            var oldShape = await _appDbContext.Shapes.FindAsync(id);

            if (oldShape == null)
            {
                return NotFound("Shape wasn't found.");
            }

            _appDbContext.Entry(oldShape).CurrentValues.SetValues(updatedShape);

            await _appDbContext.SaveChangesAsync();

            return StatusCode(201, oldShape);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShape(int id)
        {
            var shape = await _appDbContext.Shapes.FindAsync(id);

            if (shape == null)
            {
                return NotFound("Shape wasn't found.");
            }

            _appDbContext.Shapes.Remove(shape);

            await _appDbContext.SaveChangesAsync();

            return Ok("Shape deleted successfully!");
        }
    }
}