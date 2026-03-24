package com.shopwise.service;

import com.shopwise.dto.UserDto;
import com.shopwise.entity.User;
import com.shopwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * User Service — profile management and admin user operations.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDto.ProfileResponse getProfile(String username) {
        return toResponse(findByUsername(username));
    }

    public UserDto.ProfileResponse updateProfile(String username, UserDto.UpdateProfileRequest request) {
        User user = findByUsername(username);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        return toResponse(userRepository.save(user));
    }

    public void changePassword(String username, UserDto.ChangePasswordRequest request) {
        User user = findByUsername(username);
        if (user.getPassword() == null) {
            throw new RuntimeException("OAuth2 users cannot change password here");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserDto.ProfileResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private UserDto.ProfileResponse toResponse(User u) {
        UserDto.ProfileResponse r = new UserDto.ProfileResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setFullName(u.getFullName());
        r.setAvatarUrl(u.getAvatarUrl());
        r.setBio(u.getBio());
        r.setPhone(u.getPhone());
        r.setRole(u.getRole().name());
        r.setProvider(u.getProvider());
        r.setCreatedAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        return r;
    }
}
