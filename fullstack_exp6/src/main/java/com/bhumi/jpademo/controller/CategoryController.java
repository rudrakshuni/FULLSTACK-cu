package com.bhumi.jpademo.controller;

import com.bhumi.jpademo.entity.Category;
import com.bhumi.jpademo.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryRepository repository;

    public CategoryController(CategoryRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return repository.save(category);
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return repository.findAll();
    }
}