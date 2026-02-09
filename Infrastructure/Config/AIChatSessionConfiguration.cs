using System;
using Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config;

public class AIChatSessionConfiguration : IEntityTypeConfiguration<AIChatSession>
{
    public void Configure(EntityTypeBuilder<AIChatSession> builder)
    {
        builder.Property(s => s.Id).ValueGeneratedOnAdd();
        
        // Linking session to the Identity User
        builder.HasOne(s => s.AppUser)
            .WithMany()
            .HasForeignKey(s => s.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
