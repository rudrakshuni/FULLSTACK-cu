package com.bhumi.jpademo.controller;

import com.bhumi.jpademo.entity.Product;
import com.bhumi.jpademo.repository.ProductRepository;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return repository.save(product);
    }

    @GetMapping
    public Page<Product> getProducts(
            @RequestParam double min,
            @RequestParam double max,
            @RequestParam int page,
            @RequestParam int size) {

        return repository.findByPriceBetween(
                min, max,
                PageRequest.of(page, size, Sort.by("price").ascending())
        );
    }
}