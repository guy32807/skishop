using System;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class AIChatMessageConfiguration : IEntityTypeConfiguration<AIChatMessage>
{
    public void Configure(EntityTypeBuilder<AIChatMessage> builder)
    {
        builder.Property(m => m.Content).IsRequired();
        builder.Property(m => m.Role).IsRequired().HasMaxLength(20); // user or assistant

        builder.HasOne(m => m.Session)
            .WithMany()
            .HasForeignKey(m => m.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.AppUser)
            .WithMany()
            .HasForeignKey(m => m.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
