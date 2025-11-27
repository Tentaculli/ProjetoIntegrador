namespace API.Controllers
{
    using API.Data;
    using API.Models.Enums;
    using API.Models.Order;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Shared.DTOs;
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;

        public OrderController(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        private int ToShapeInt(ShapeType shape)
        {
            return (int)shape;
        }


        [HttpPost]
        public async Task<IActionResult> NewOrder([FromBody] Order order)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validar se o cliente existe
            var clientExists = await _appDbContext.Clients.AnyAsync(c => c.Id == order.ClientId);
            if (!clientExists)
            {
                return BadRequest($"Client with ID {order.ClientId} does not exist.");
            }

            _appDbContext.Orders.Add(order);
            await _appDbContext.SaveChangesAsync();

            return Created("Order created successfully!", order);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
        {
            var orders = await _appDbContext.Orders.ToListAsync();

            return Ok(orders);
        }

        [HttpGet("oldest-waiting")]
        public async Task<ActionResult<Order>> GetOldestWaitingOrder()
        {
            var order = await _appDbContext.Orders
                .Where(o => o.Status == StatusType.Waiting)
                .OrderBy(o => o.Created)      // Order by created date
                .FirstOrDefaultAsync();  // Get first item on list

            if (order == null)
                return NotFound("No order with 'Waiting' status has been found.");

            return Ok(order);
        }

        [HttpGet("newOrder")]
        public async Task<ActionResult<Order>> GetNewOrder()
        {
            var order = await _appDbContext.Orders
                .Where(o => o.Status == StatusType.InProgress)
                .OrderBy(o => o.Created)      // Order by created date
                .FirstOrDefaultAsync();  // Get first item on list

            if (order == null)
                return NotFound("NNo order with 'In Progress' status has been found.");

            var dto = new OrderForNodeDto
            {
                Id = order.Id,

                Pin1Pos1 = ToShapeInt(order.Pin1Pos1),
                Pin1Pos2 = ToShapeInt(order.Pin1Pos2),
                Pin1Pos3 = ToShapeInt(order.Pin1Pos3),

                Pin2Pos1 = ToShapeInt(order.Pin2Pos1),
                Pin2Pos2 = ToShapeInt(order.Pin2Pos2),
                Pin2Pos3 = ToShapeInt(order.Pin2Pos3),
            };

            return Ok(dto);
        }

        [HttpGet ("{id}")]
        public async Task<ActionResult<Order>> GetOrderById(int id)
        {
            var order = await _appDbContext.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound("Order wasn't found.");
            }

            return Ok(order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] Order updatedOrder)
        {
            var order = await _appDbContext.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound("Order wasn't found.");
            }
            
            if (order.Status != StatusType.Waiting)
            {
                return BadRequest("This order can no longer be changed.");
            }

            // Validate if the client exists
            if (order.ClientId != updatedOrder.ClientId)
            {
                var clientExists = await _appDbContext.Clients.AnyAsync(c => c.Id == updatedOrder.ClientId);
                if (!clientExists)
                {
                    return BadRequest($"Client with ID {updatedOrder.ClientId} does not exist.");
                }
                order.ClientId = updatedOrder.ClientId;
            }

            order.Pin1Pos1 = updatedOrder.Pin1Pos1;
            order.Pin1Pos2 = updatedOrder.Pin1Pos2;
            order.Pin1Pos3 = updatedOrder.Pin1Pos3;

            order.Pin2Pos1 = updatedOrder.Pin2Pos1;
            order.Pin2Pos2 = updatedOrder.Pin2Pos2;
            order.Pin2Pos3 = updatedOrder.Pin2Pos3;

            await _appDbContext.SaveChangesAsync();

            return StatusCode(201, order);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] StatusType newStatus)
        {
            var order = await _appDbContext.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound("Order wasn't found.");
            }

            var validationError = ValidateStatusTransition(order.Status, newStatus);
            if (validationError != null)
            {
                return BadRequest(validationError);
            }

            order.Status = newStatus;
            await _appDbContext.SaveChangesAsync();

            return Ok(new { Message = "Order status updated successfully!", Order = order });
        }

        [HttpPut("oldest/start")]
        public async Task<IActionResult> StartOldestWaitingOrder()
        {
            var hasInProgress = await _appDbContext.Orders
                .AnyAsync(o => o.Status == StatusType.InProgress);

            if (hasInProgress)
            {
                return BadRequest("There is already an order in 'InProgress' status. Only one order can be 'InProgress' at a time.");
            }

            var order = await _appDbContext.Orders
                .Where(o => o.Status == StatusType.Waiting)
                .OrderBy(o => o.Created)
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound("No orders with status 'Waiting' were found.");
            }

            var validationError = ValidateStatusTransition(order.Status, StatusType.InProgress);
            if (validationError != null)
            {
                return BadRequest(validationError);
            }

            order.Status = StatusType.InProgress;
            await _appDbContext.SaveChangesAsync();

            return Ok(new
            {
                Message = "Oldest 'Waiting' order has been updated to 'InProgress' successfully.",
                Order = order
            });
        }


        private string? ValidateStatusTransition(StatusType currentStatus, StatusType newStatus)
        {
            if (currentStatus == newStatus)
            {
                return "The order is already in this status.";
            }

            switch (currentStatus)
            {
                case StatusType.Waiting:
                    // From Waiting it can go to InProgress or Canceled
                    if (newStatus != StatusType.InProgress && newStatus != StatusType.Canceled)
                    {
                        return "Orders in 'Waiting' status can only be moved to 'InProgress' or 'Canceled'.";
                    }
                    break;

                case StatusType.InProgress:
                    // De InProgress it can go to Finished or Canceled
                    if (newStatus != StatusType.Finished && newStatus != StatusType.Canceled)
                    {
                        return "Orders in 'InProgress' status can only be moved to 'Finished' or 'Canceled'.";
                    }
                    break;

                case StatusType.Finished:
                    // Completed orders cannot change status.
                    return "Finished orders cannot be changed.";

                case StatusType.Canceled:
                    // Completed orders cannot change status.
                    return "Canceled orders cannot be changed.";
            }

            return null;
        }
    }
}