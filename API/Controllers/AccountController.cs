using System;
using API.DTOs;
using API.Extensions;
using Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AccountController(SignInManager<AppUser> signInManager) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterDto registerDto)
    {
        var user = new AppUser
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName
        };

        var result = await signInManager.UserManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }

        await signInManager.SignInAsync(user, isPersistent: false);

        return Ok();
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return NoContent();
    }

    [HttpGet("user-info")]
    public async Task<ActionResult> GetUserInfo()
    {
        var user = await signInManager.UserManager.GetUserByEmailWithAddressesAsync(User);

        var userInfo = new
        {
            user.FirstName,
            user.LastName,
            user.Email,
            Address = user.Address?.ToAddressDto()
        };
        return Ok(userInfo);
    }

    [HttpGet("test-auth")]
    public ActionResult TestAuth()
    {
        return Ok("You are authenticated!");
    }

    [HttpGet]
    public ActionResult GetAuthState()
    {
        if (User.Identity != null && User.Identity.IsAuthenticated)
        {
            return Ok(new { isAuthenticated = true });
        }
        else
        {
            return Ok(new { isAuthenticated = false });
        }
    }

    [Authorize]
    [HttpPost("address")]
    public async Task<ActionResult<Address>> CreateOrUpdateAddress(AddressDto addressDto)
    {
        var user = await signInManager.UserManager.GetUserByEmailWithAddressesAsync(User);

        if (user.Address == null)
        {
            user.Address = addressDto.ToAddress();
        }
        else
        {
            user.Address.UpdateAddressFromDto(addressDto);
        }

        var result = await signInManager.UserManager.UpdateAsync(user);
        if (result.Succeeded) return Ok(user.Address.ToAddressDto());
        return BadRequest("Problem updating the user address");
    }
}