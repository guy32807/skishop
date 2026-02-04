using System;
using Core.Entities;
using Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Infrastructure.Services;

public class PaymentService(IConfiguration config, 
    ICartService cartService, 
    IGenericRepository<Core.Entities.Product> productRepo, 
    IGenericRepository<DeliveryMethod> dmRepo) : IPaymentService
{
    public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
    {
        StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];
        var cart = await cartService.GetCartAsync(cartId);
        if (cart == null) return null;

        // 1. Validate prices against DB (Trust no one!)
        foreach (var item in cart.Items)
        {
            var productItem = await productRepo.GetByIdAsync(item.ProductId);
            if (productItem == null) return null;
            item.Price = productItem.Price; 
        }

        // 2. Calculate Shipping
        var shippingPrice = 0m;
        if (cart.DeliveryMethodId.HasValue)
        {
            var deliveryMethod = await dmRepo.GetByIdAsync(cart.DeliveryMethodId.Value);
            if (deliveryMethod == null) return null;
            shippingPrice = deliveryMethod.Price;
        }

        // 3. Total Amount in Cents (Watch the parentheses!)
        var subtotal = cart.Items.Sum(x => x.Quantity * (x.Price * 100));
        var total = (long)subtotal + (long)(shippingPrice * 100);

        // 4. Stripe Logic
        var service = new PaymentIntentService();
        if (string.IsNullOrEmpty(cart.PaymentIntentId))
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = total,
                Currency = "usd",
                PaymentMethodTypes = ["card"]
            };
            var intent = await service.CreateAsync(options);
            cart.PaymentIntentId = intent.Id;
            cart.ClientSecret = intent.ClientSecret;
        }
        else
        {
            var options = new PaymentIntentUpdateOptions { Amount = total };
            await service.UpdateAsync(cart.PaymentIntentId, options);
        }

        await cartService.UpdateCartAsync(cart);
        return cart;
    }
}