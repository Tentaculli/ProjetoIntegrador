using API.Data;
using API.Models.Client;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClientController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;

        public ClientController(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        [HttpPost]
        public async Task<IActionResult> AddClient([FromBody] Client client)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _appDbContext.Clients.Add(client);
            await _appDbContext.SaveChangesAsync();

            return Created("Client created successfully!", client);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Client>>> GetAllClients()
        {
            var clients = await _appDbContext.Clients.ToListAsync();
            return Ok(clients);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Client>> GetClientById(int id)
        {
            var client = await _appDbContext.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound("Client wasn't found.");
            }

            return Ok(client);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, [FromBody] Client updatedClient)
        {
            var client = await _appDbContext.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound("Client wasn't found.");
            }

            client.Name = updatedClient.Name;
            client.Email = updatedClient.Email;
            client.Password = updatedClient.Password;
            client.Active = updatedClient.Active;

            await _appDbContext.SaveChangesAsync();

            return StatusCode(201, client);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _appDbContext.Clients.FindAsync(id);

            if (client == null)
            {
                return NotFound("Client wasn't found.");
            }

            _appDbContext.Clients.Remove(client);
            await _appDbContext.SaveChangesAsync();

            return Ok("Client deleted successfully!");
        }
    }
}