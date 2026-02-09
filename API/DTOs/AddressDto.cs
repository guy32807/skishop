using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class AddressDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    [Required]
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    [Required]
    public string City { get; set; } = string.Empty;
    [Required]
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
}
