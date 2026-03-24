package com.shopwise.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Data Transfer Objects for authentication endpoints.
 * These decouple the API contract from internal entity structure.
 */
public class AuthDto {

    // ─── Request DTOs ────────────────────────────────────────────────────────

    @Data
    public static class LoginRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank
        @Size(min = 3, max = 50)
        private String username;

        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 6, max = 120)
        private String password;

        @NotBlank
        private String fullName;
    }

    // ─── Response DTOs ───────────────────────────────────────────────────────

    @Data
    public static class JwtResponse {
        private String token;
        private String type = "Bearer";
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String role;
        private String avatarUrl;

        public JwtResponse(String token, Long id, String username, String email,
                           String fullName, String role, String avatarUrl) {
            this.token = token;
            this.id = id;
            this.username = username;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.avatarUrl = avatarUrl;
        }
    }

    @Data
    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }
    }
}
