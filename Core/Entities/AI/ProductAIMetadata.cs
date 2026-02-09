using System;

namespace Core.Entities;

public class ProductAIMetadata : BaseEntity
{
    public required Product Product { get; set; }
    public required int ProductId { get; set; }
    public string? AISummary { get; set; }
    public string? SearchVector { get; set; }
    public float[]? Vector { get; set; }

}
