package com.shopwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ShopWise Application Entry Point
 *
 * This is a full-stack e-commerce platform with:
 * - JWT-based authentication (local users)
 * - OAuth2 / OpenID Connect SSO (Google, GitHub)
 * - Role-Based Access Control (RBAC): ADMIN and USER roles
 * - Product management with role-restricted CRUD operations
 * - User profile management
 */
@SpringBootApplication
public class ShopWiseApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopWiseApplication.class, args);
    }
}
