using System;

namespace Core.Entities;

public class AIChatMessage : BaseEntity
{
    public required string Content { get; set; } = string.Empty;
    public required string Role { get; set; } = "user"; // "user" or "assistant"
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public required string AppUserId { get; set; }
    public required AppUser AppUser { get; set; }
    public required int SessionId { get; set; }
    public required AIChatSession Session { get; set; }
}
