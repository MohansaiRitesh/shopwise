package com.shopwise.config;

import com.shopwise.security.AuthTokenFilter;
import com.shopwise.security.JwtUtils;
import com.shopwise.security.OAuth2AuthenticationSuccessHandler;
import com.shopwise.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security Configuration
 *
 * Configures:
 * 1. Stateless JWT authentication for REST API endpoints
 * 2. OAuth2 Login with SSO providers (Google, GitHub)
 * 3. Role-Based Access Control (RBAC):
 *    - ADMIN: Full CRUD on products
 *    - USER: Read-only access to products
 * 4. CORS for React frontend
 * 5. BCrypt password hashing
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Enables @PreAuthorize annotations on controller methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtils jwtUtils;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    /**
     * Register the JWT filter as a Spring bean.
     */
    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter(jwtUtils, userDetailsService);
    }

    /**
     * BCrypt password encoder (strength factor = 12).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * DAO authentication provider using our UserDetailsService + BCrypt.
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Expose AuthenticationManager as a bean so controllers can use it.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * CORS configuration: allow requests from the React dev server.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Main security filter chain.
     *
     * Access rules (RBAC):
     * - Public:               POST /api/auth/**  (login, register)
     * - Authenticated:        GET  /api/products/**
     * - ADMIN only:           POST/PUT/DELETE /api/products/**
     * - Authenticated:        GET/PUT /api/users/me (own profile)
     * - ADMIN only:           GET /api/users (all users)
     * - OAuth2 callback:      /oauth2/**  (public, handled by Spring)
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (we use stateless JWT, not cookies/sessions)
            .csrf(csrf -> csrf.disable())

            // Enable CORS with our config above
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless session (no HTTP sessions — JWT handles auth state)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // URL authorization rules
            .authorizeHttpRequests(auth -> auth
                // H2 console (development only)
                .requestMatchers("/h2-console/**").permitAll()

                // Authentication endpoints — open to all
                .requestMatchers("/api/auth/**").permitAll()

                // OAuth2 endpoints — handled by Spring OAuth2
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                // Product READ — any authenticated user (ADMIN or USER)
                .requestMatchers(HttpMethod.GET, "/api/products/**").authenticated()

                // Product WRITE — ADMIN only
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                // User profile — any authenticated user can access their own profile
                .requestMatchers("/api/users/me/**").authenticated()

                // User list — ADMIN only
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            // Configure OAuth2 login
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint ->
                        endpoint.baseUri("/oauth2/authorize"))
                .redirectionEndpoint(endpoint ->
                        endpoint.baseUri("/login/oauth2/code/*"))
                .successHandler(oAuth2AuthenticationSuccessHandler)
            )

            // Register our DAO provider
            .authenticationProvider(authenticationProvider())

            // Add JWT filter before the standard username/password filter
            .addFilterBefore(authenticationJwtTokenFilter(),
                    UsernamePasswordAuthenticationFilter.class);

        // Allow H2 console frames (development only)
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}
