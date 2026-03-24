package com.shopwise.security;

import com.shopwise.entity.User;
import com.shopwise.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;

/**
 * OAuth2 Authentication Success Handler
 *
 * After a successful OAuth2/OIDC login (Google, GitHub, etc.):
 * 1. Extracts user info from the OAuth2 principal
 * 2. Creates or updates the local User record (linking SSO identity)
 * 3. Issues a JWT token
 * 4. Redirects the user to the React frontend with the JWT in query params
 *
 * This bridges the OAuth2 flow with our JWT-based API authentication.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        // Determine the provider from the registered client ID
        String provider = determineProvider(oAuth2User);
        String providerId = oAuth2User.getName(); // OAuth2 subject

        // Find or create the user in our database
        User user = findOrCreateUser(email, name, picture, provider, providerId);

        // Generate a JWT for the user
        String token = jwtUtils.generateTokenFromUsername(user.getUsername());

        // Redirect to frontend with the token
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                .queryParam("token", token)
                .queryParam("username", user.getUsername())
                .queryParam("role", user.getRole().name())
                .build().toUriString();

        log.info("OAuth2 login successful for user: {} ({})", user.getUsername(), provider);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    /**
     * Find an existing user by OAuth2 provider+ID, or by email, or create a new one.
     */
    private User findOrCreateUser(String email, String name, String picture,
                                  String provider, String providerId) {
        // Try to find by provider ID first
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(provider, providerId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update profile picture if changed
            user.setAvatarUrl(picture);
            return userRepository.save(user);
        }

        // Try to find by email (user may have registered locally with same email)
        if (email != null) {
            Optional<User> userByEmail = userRepository.findByEmail(email);
            if (userByEmail.isPresent()) {
                User user = userByEmail.get();
                user.setProvider(provider);
                user.setProviderId(providerId);
                user.setAvatarUrl(picture);
                return userRepository.save(user);
            }
        }

        // Create a new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(name != null ? name : "OAuth2 User");
        newUser.setAvatarUrl(picture);
        newUser.setProvider(provider);
        newUser.setProviderId(providerId);
        newUser.setRole(User.Role.ROLE_USER); // OAuth2 users get USER role by default
        newUser.setPassword(null); // No local password for OAuth2 users

        // Generate a unique username from email or name
        String baseUsername = email != null
                ? email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "")
                : (name != null ? name.replaceAll("\\s+", "").toLowerCase() : "user");
        newUser.setUsername(generateUniqueUsername(baseUsername));

        return userRepository.save(newUser);
    }

    private String generateUniqueUsername(String base) {
        String username = base;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + counter++;
        }
        return username;
    }

    private String determineProvider(OAuth2User oAuth2User) {
        // GitHub users have a "login" attribute; Google users have a "sub"
        if (oAuth2User.getAttribute("login") != null) {
            return "github";
        }
        return "google";
    }
}
