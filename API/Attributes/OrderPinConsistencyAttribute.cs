using System.ComponentModel.DataAnnotations;
using API.Models.Enums;
using API.Models.Order;

namespace API.Attributes
{
    public class OrderPinConsistencyAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var order = validationContext.ObjectInstance as Order;

            if (order == null) return ValidationResult.Success;

            if (order.Pin1Pos1 == ShapeType.None || 
                order.Pin1Pos2 == ShapeType.None || 
                order.Pin1Pos3 == ShapeType.None)
            {
                return new ValidationResult("All positions in Pin 1 are mandatory.");
            }

            int pin2FilledCount = 0;

            if (order.Pin2Pos1 != ShapeType.None) pin2FilledCount++;
            if (order.Pin2Pos2 != ShapeType.None) pin2FilledCount++;
            if (order.Pin2Pos3 != ShapeType.None) pin2FilledCount++;

            if (pin2FilledCount != 0 && pin2FilledCount != 3)
            {
                return new ValidationResult("Pin 2 must be either completely empty or completely filled.");
            }

            return ValidationResult.Success;
        }
    }
}