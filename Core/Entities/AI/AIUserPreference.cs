using System;

namespace Core.Entities.AI;

public class AIUserPreference : BaseEntity
{
    public string? AppUserId { get; set; }
    public required AppUser AppUser { get; set; }
    public string? PreferenceType { get; set; }
}
