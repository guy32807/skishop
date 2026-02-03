using System;
using System.Security.Authentication;
using System.Security.Claims;
using Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ClaimsPrincipleExtensions
{
    public static async Task<AppUser> GetUserByEmailAsync(this UserManager<AppUser> userManager, ClaimsPrincipal user)
    {
        var email = user.GetEmailFromClaims();
        var userToReturn = await userManager.Users
            .SingleOrDefaultAsync(u => u.Email == email) ?? throw new AuthenticationException("User not found");
        return userToReturn;
    }

    public static async Task<AppUser> GetUserByEmailWithAddressesAsync(this UserManager<AppUser> userManager, ClaimsPrincipal user)
    {
        var email = user.GetEmailFromClaims();
        var userToReturn = await userManager.Users
            .Include(u => u.Address)
            .SingleOrDefaultAsync(u => u.Email == email) ?? throw new AuthenticationException("User not found");
        return userToReturn;
    }

    public static string GetEmailFromClaims(this ClaimsPrincipal user)
    {
        var email = user.FindFirstValue(ClaimTypes.Email) 
                ?? user.FindFirstValue(ClaimTypes.Name);

    if (string.IsNullOrEmpty(email)) 
        throw new AuthenticationException("Email claim not found");

    return email;
    }
}
