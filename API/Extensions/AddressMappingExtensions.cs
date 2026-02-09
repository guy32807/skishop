using System;
using API.DTOs;
using Core.Entities;

namespace API.Extensions;

public static class AddressMappingExtensions
{
    public static AddressDto ToAddressDto(this Address address)
    {
        ArgumentNullException.ThrowIfNull(address);
        return new AddressDto
        {
            Line1 = address.Line1,
            Line2 = address.Line2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country
        };
    }
    public static Address ToAddress(this AddressDto addressDto)
    {
        ArgumentNullException.ThrowIfNull(addressDto);
        return new Address
        {
            Line1 = addressDto.Line1,
            Line2 = addressDto.Line2,
            City = addressDto.City,
            State = addressDto.State,
            PostalCode = addressDto.PostalCode,
            Country = addressDto.Country
        };
    }

    public static void UpdateAddressFromDto(this Address address, AddressDto addressDto)
    {
        ArgumentNullException.ThrowIfNull(address);
        ArgumentNullException.ThrowIfNull(addressDto);
        address.Line1 = addressDto.Line1;
        address.Line2 = addressDto.Line2;
        address.City = addressDto.City;
        address.State = addressDto.State;
        address.PostalCode = addressDto.PostalCode;
        address.Country = addressDto.Country;
    }
}
