using System;
using System.Text.Json;
using Core.Entities;

namespace Infrastructure.Data;

public class StoreContextSeed
{
    private static readonly JsonSerializerOptions Options = new() 
    { 
        PropertyNameCaseInsensitive = true 
    };

    public static async Task SeedAsync(StoreContext context)
    {
        var path = Path.GetDirectoryName(typeof(StoreContextSeed).Assembly.Location);

        if (!context.Products.Any())
        {
            await SeedEntityAsync<Product>(context, path + "/Data/SeedData/products.json");
        }

        if (!context.DeliveryMethods.Any())
        {
            await SeedEntityAsync<DeliveryMethod>(context, path + "/Data/SeedData/delivery.json");
        }
    }

    private static async Task SeedEntityAsync<T>(StoreContext context, string filePath) where T : class
    {
        if (!File.Exists(filePath)) return;

        var data = await File.ReadAllTextAsync(filePath);
        var items = JsonSerializer.Deserialize<List<T>>(data, Options);

        if (items != null)
        {
            context.Set<T>().AddRange(items);
            await context.SaveChangesAsync();
        }
    }
}
