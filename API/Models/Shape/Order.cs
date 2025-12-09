using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using API.Attributes;
using API.Models.Enums;
using ClientModel = API.Models.Client.Client;

namespace API.Models.Order
{
    [OrderPinConsistency]
    [NoDuplicateShapes]
    public class Order
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public ShapeType Pin1Pos1 { get; set; }
        public ShapeType Pin1Pos2 { get; set; }
        public ShapeType Pin1Pos3 { get; set; }
        
        public ShapeType Pin2Pos1 { get; set; }
        public ShapeType Pin2Pos2 { get; set; }
        public ShapeType Pin2Pos3 { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime Created { get; set; }
        
        [Required(ErrorMessage = "ClientId is required")]
        [ForeignKey("ClientId")]
        public int ClientId { get; set; }

        [ForeignKey("ClientId")]
        public virtual ClientModel? Client { get; set; }    
        public StatusType Status { get; set; }

        public int StatusByPosition { get; set; }
    }
}