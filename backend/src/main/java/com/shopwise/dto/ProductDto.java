package com.shopwise.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTOs for Product API.
 */
public class ProductDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        @Size(min = 2, max = 200)
        private String name;

        private String description;

        @NotNull
        @DecimalMin("0.0")
        private BigDecimal price;

        @NotBlank
        private String category;

        private String brand;
        private String imageUrl;

        @Min(0)
        private Integer stockQuantity = 0;

        private Boolean featured = false;
    }

    @Data
    public static class UpdateRequest {
        @Size(min = 2, max = 200)
        private String name;

        private String description;

        @DecimalMin("0.0")
        private BigDecimal price;

        private String category;
        private String brand;
        private String imageUrl;

        @Min(0)
        private Integer stockQuantity;

        private Boolean featured;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private String category;
        private String brand;
        private String imageUrl;
        private Integer stockQuantity;
        private BigDecimal rating;
        private Integer reviewCount;
        private Boolean featured;
        private String createdAt;
        private String updatedAt;
    }
}
