package com.shopwise.controller;

import com.shopwise.dto.UserDto;
import com.shopwise.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * User Controller
 *
 * GET  /api/users/me           — own profile (any authenticated user)
 * PUT  /api/users/me           — update own profile
 * POST /api/users/me/password  — change own password
 * GET  /api/users              — list all users (ADMIN only)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto.ProfileResponse> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto.ProfileResponse> updateProfile(
            Authentication auth,
            @Valid @RequestBody UserDto.UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }

    @PostMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> changePassword(
            Authentication auth,
            @Valid @RequestBody UserDto.ChangePasswordRequest request) {
        userService.changePassword(auth.getName(), request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto.ProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
