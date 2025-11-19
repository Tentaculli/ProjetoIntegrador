using System.ComponentModel.DataAnnotations;
using System.Linq;
using API.Models.Enums;
using API.Models.Order;

namespace API.Attributes
{
    public class NoDuplicateShapesAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var order = validationContext.ObjectInstance as Order;

            if (order == null) return ValidationResult.Success;

            if (HasDuplicates(order.Pin1Pos1, order.Pin1Pos2, order.Pin1Pos3))
            {
                return new ValidationResult("Pin 1 cannot have duplicate shapes.");
            }

            if (HasDuplicates(order.Pin2Pos1, order.Pin2Pos2, order.Pin2Pos3))
            {
                return new ValidationResult("Pin 2 cannot have duplicate shapes.");
            }

            return ValidationResult.Success;
        }

        private bool HasDuplicates(ShapeType pos1, ShapeType pos2, ShapeType pos3)
        {
            var shapes = new[] { pos1, pos2, pos3 }
                         .Where(s => s != ShapeType.None)
                         .ToList();

            return shapes.Distinct().Count() != shapes.Count();
        }
    }
}