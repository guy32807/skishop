using System;
using Core.Entities;
using Core.Entities.AI;
using Core.Entities.OrderAggregate;
using Infrastructure.Config;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class StoreContext(DbContextOptions options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Product> Products { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<DeliveryMethod> DeliveryMethods { get; set; }
    public DbSet<AIChatSession> AIChatSessions { get; set; }
    public DbSet<AIChatMessage> AIChatMessages { get; set; }
    public DbSet<AIUserPreference> AIUserPreferences { get; set; }
    public DbSet<ProductAIMetadata> ProductAiMetadata { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DeliveryMethodConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ProductAIMetadataConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AIChatSessionConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AIChatMessageConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderConfiguration).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderItemConfiguration).Assembly);
    }
}
