using System;

namespace Core.Entities;

public class AIChatSession : BaseEntity
{
    public required AppUser AppUser { get; set; }
    public required string AppUserId { get; set; }
    public DateTime StartTime { get; set; }
    public bool IsActive { get; set; }
}
