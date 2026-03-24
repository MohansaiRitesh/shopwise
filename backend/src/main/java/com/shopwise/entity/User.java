package com.shopwise.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User Entity
 *
 * Represents an application user. Supports both:
 * 1. Local authentication (username + password)
 * 2. OAuth2/SSO login (via Google, GitHub, etc.)
 *
 * Roles:
 * - ADMIN: Can create, read, update, delete products
 * - USER:  Can only view products
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 50)
    @Column(nullable = false, unique = true)
    private String username;

    @Email
    @Column(unique = true)
    private String email;

    /**
     * Null for OAuth2 users (they don't have a local password).
     */
    @Column
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column
    private String avatarUrl;

    @Column
    private String bio;

    @Column
    private String phone;

    /**
     * The user's role: ROLE_ADMIN or ROLE_USER.
     * Spring Security requires the "ROLE_" prefix.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.ROLE_USER;

    /**
     * The OAuth2 provider (e.g., "google", "github") or null for local users.
     */
    @Column
    private String provider;

    /**
     * The OAuth2 provider's user ID, used to link accounts on subsequent logins.
     */
    @Column
    private String providerId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Role {
        ROLE_ADMIN,
        ROLE_USER
    }
}
