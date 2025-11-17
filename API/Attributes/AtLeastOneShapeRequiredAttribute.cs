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

            // Verifica se pelo menos um dos ShapePos está preenchido (diferente de None ou 0)
            if (order.ShapePos1 != default(ShapeType) || 
                order.ShapePos2 != default(ShapeType) || 
                order.ShapePos3 != default(ShapeType))
            {
                return ValidationResult.Success;
            }

            return new ValidationResult("At least one shape position (ShapePos1, ShapePos2, or ShapePos3) must be filled.");
        }
    }
}
