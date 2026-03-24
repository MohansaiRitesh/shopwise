package com.shopwise.service;

import com.shopwise.dto.ProductDto;
import com.shopwise.entity.Product;
import com.shopwise.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Product Service — business logic for product management.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDto.Response> getAllProducts(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    public Page<ProductDto.Response> getByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return productRepository.findByCategory(category, pageable).map(this::toResponse);
    }

    public Page<ProductDto.Response> search(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchProducts(keyword, pageable).map(this::toResponse);
    }

    public List<ProductDto.Response> getFeatured() {
        return productRepository.findByFeaturedTrue().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public ProductDto.Response getById(Long id) {
        return toResponse(findById(id));
    }

    public ProductDto.Response create(ProductDto.CreateRequest request) {
        Product product = new Product();
        mapRequest(product, request);
        return toResponse(productRepository.save(product));
    }

    public ProductDto.Response update(Long id, ProductDto.UpdateRequest request) {
        Product product = findById(id);
        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getBrand() != null) product.setBrand(request.getBrand());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getFeatured() != null) product.setFeatured(request.getFeatured());
        return toResponse(productRepository.save(product));
    }

    public void delete(Long id) {
        productRepository.delete(findById(id));
    }

    public List<String> getCategories() {
        return productRepository.findAll().stream()
                .map(Product::getCategory).distinct().sorted().collect(Collectors.toList());
    }

    // Helpers

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    private void mapRequest(Product p, ProductDto.CreateRequest r) {
        p.setName(r.getName());
        p.setDescription(r.getDescription());
        p.setPrice(r.getPrice());
        p.setCategory(r.getCategory());
        p.setBrand(r.getBrand());
        p.setImageUrl(r.getImageUrl());
        p.setStockQuantity(r.getStockQuantity());
        p.setFeatured(r.getFeatured());
    }

    private ProductDto.Response toResponse(Product p) {
        ProductDto.Response r = new ProductDto.Response();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setPrice(p.getPrice());
        r.setCategory(p.getCategory());
        r.setBrand(p.getBrand());
        r.setImageUrl(p.getImageUrl());
        r.setStockQuantity(p.getStockQuantity());
        r.setRating(p.getRating());
        r.setReviewCount(p.getReviewCount());
        r.setFeatured(p.getFeatured());
        r.setCreatedAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        r.setUpdatedAt(p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null);
        return r;
    }
}
