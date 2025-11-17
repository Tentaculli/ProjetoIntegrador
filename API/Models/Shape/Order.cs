using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using API.Attributes;
using API.Models.Enums;

namespace API.Models.Order
{
    [AtLeastOneShapeRequired]
    public class Order
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public ShapeType ShapePos1 { get; set; }
        public ShapeType ShapePos2 { get; set; }
        public ShapeType ShapePos3 { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime Created { get; set; }
        public StatusType Status { get; set; }
    }
}