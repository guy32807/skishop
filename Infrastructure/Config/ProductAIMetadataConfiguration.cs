using System;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class ProductAIMetadataConfiguration : IEntityTypeConfiguration<ProductAIMetadata>
{
    public void Configure(EntityTypeBuilder<ProductAIMetadata> builder)
    {
        builder.Property(p => p.AISummary).IsRequired().HasMaxLength(1000);
builder.Property(x => x.Vector).HasColumnType("nvarchar(max)"); 

        // This links the AI Metadata to the Product
        builder.HasOne(x => x.Product)
            .WithOne()
            .HasForeignKey<ProductAIMetadata>(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
