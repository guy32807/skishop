using System;
using API.RequestHelpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;


public class ProductsController(IGenericRepository<Product> productRepository) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery]ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams);

        return await CreatePaginatedResult(productRepository, spec, specParams.PageIndex, specParams.PageSize);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await productRepository.GetByIdAsync(id);

        if(product == null)
        {
            return NotFound();
        }
        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        productRepository.Add(product);

        if(await productRepository.SaveAllAsync())
        {
            return CreatedAtAction("GetProduct", new {id = product.Id}, product);
        }

        return BadRequest("Unable to create the product");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if(product.Id != id || !ProductExists(id))
        {
            return BadRequest("Cannot update this product");
        }
        productRepository.Update(product);

        if(await productRepository.SaveAllAsync())
        {
            return NoContent();
        }

        return BadRequest("Unable to update product");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await productRepository.GetByIdAsync(id);

        if(product == null) return NotFound();

        productRepository.Remove(product);

        if(await productRepository.SaveAllAsync())
        {
            return NoContent();
        }

        return BadRequest("Unable to delete product");
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var spec = new BrandListSpecification();
        return Ok(await productRepository.ListAsync(spec));
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var spec = new TypeListSpecification();
        return Ok(await productRepository.ListAsync(spec));
    }

    private bool ProductExists(int id)
    {
        return productRepository.Exists(id);
    }
}
