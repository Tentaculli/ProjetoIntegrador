using System.ComponentModel.DataAnnotations;
using API.Models.Enums;
using API.Models.Order;

namespace API.Attributes
{
    public class AtLeastOneShapeRequiredAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var order = (Order)validationContext.ObjectInstance;

            // Verifica se pelo menos um dos ShapePos está preenchido (diferente de None)
            if (order.ShapePos1 != ShapeType.None || 
                order.ShapePos2 != ShapeType.None || 
                order.ShapePos3 != ShapeType.None)
            {
                return ValidationResult.Success;
            }

            return new ValidationResult("At least one shape position (ShapePos1, ShapePos2, or ShapePos3) must be filled.");
        }
    }
}
