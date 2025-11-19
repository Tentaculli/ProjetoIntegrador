using System.Text.Json.Serialization;

namespace API.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ShapeType
    {
        None = 0,
        Hexagon = 1,
        Square = 2,
        Circle = 3
    }
}
