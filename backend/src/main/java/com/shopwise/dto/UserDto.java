package com.shopwise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class UserDto {

    @Data
    public static class ProfileResponse {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String avatarUrl;
        private String bio;
        private String phone;
        private String role;
        private String provider;
        private String createdAt;
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        @Email
        private String email;
        private String bio;
        private String phone;
        private String avatarUrl;
    }

    @Data
    public static class ChangePasswordRequest {
        private String currentPassword;
        @Size(min = 6, max = 120)
        private String newPassword;
    }
}
