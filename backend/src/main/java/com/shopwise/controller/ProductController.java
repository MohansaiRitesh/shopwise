package com.shopwise.controller;

import com.shopwise.dto.ProductDto;
import com.shopwise.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Product Controller — RBAC enforced via @PreAuthorize
 *
 * GET    /api/products           — authenticated (ADMIN + USER)
 * GET    /api/products/{id}      — authenticated
 * GET    /api/products/featured  — authenticated
 * GET    /api/products/categories— authenticated
 * GET    /api/products/search    — authenticated
 * POST   /api/products           — ADMIN only
 * PUT    /api/products/{id}      — ADMIN only
 * DELETE /api/products/{id}      — ADMIN only
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ProductDto.Response>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String category) {

        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(productService.getByCategory(category, page, size));
        }
        return ResponseEntity.ok(productService.getAllProducts(page, size, sortBy, direction));
    }

    @GetMapping("/featured")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProductDto.Response>> getFeatured() {
        return ResponseEntity.ok(productService.getFeatured());
    }

    @GetMapping("/categories")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ProductDto.Response>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.search(keyword, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProductDto.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.Response> create(@Valid @RequestBody ProductDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.Response> update(@PathVariable Long id,
                                                       @RequestBody ProductDto.UpdateRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
