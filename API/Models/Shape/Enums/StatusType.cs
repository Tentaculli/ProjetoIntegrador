using System.Text.Json.Serialization;

namespace API.Models.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum StatusType
    {
        Waiting = 1,
        InProgress = 2,
        Finished = 3,
        Canceled = 4
    }
}