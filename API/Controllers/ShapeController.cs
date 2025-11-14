using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Models;
using Microsoft.AspNetCore.Mvc;

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
            _appDbContext.Tentaculli.Add(shape);
            await _appDbContext.SaveChangesAsync();

            return Ok(shape);
        }
    }
}