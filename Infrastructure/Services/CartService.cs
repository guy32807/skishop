using System;
using Core.Entities;
using Core.Interfaces;
using StackExchange.Redis;

namespace Infrastructure.Services;

public class CartService(IConnectionMultiplexer redis) : ICartService
{
    private readonly IDatabase _database = redis.GetDatabase();
    public async Task<bool> DeleteCartAsync(string cartId)
    {
        return await _database.KeyDeleteAsync(cartId);
    }

    public Task<ShoppingCart?> GetCartAsync(string cartId)
    {
        var data =  _database.StringGet(cartId);
        if (data.IsNullOrEmpty) return Task.FromResult<ShoppingCart?>(null);
        return Task.FromResult(System.Text.Json.JsonSerializer.Deserialize<ShoppingCart>(data.ToString()));
    }

    public async Task<ShoppingCart?> UpdateCartAsync(ShoppingCart cart)
    {
        var created = await _database.StringSetAsync(cart.Id, System.Text.Json.JsonSerializer.Serialize(cart), TimeSpan.FromDays(30));
        if (!created) return null;
        return await GetCartAsync(cart.Id);
    }
}
