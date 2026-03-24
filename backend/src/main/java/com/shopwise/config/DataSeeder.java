package com.shopwise.config;

import com.shopwise.entity.Product;
import com.shopwise.entity.User;
import com.shopwise.repository.ProductRepository;
import com.shopwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Data Seeder
 *
 * Runs on application startup and seeds the database with:
 * 1. Two predefined users:
 *    - admin / Admin@123  (ROLE_ADMIN)  — can create/update/delete products
 *    - user  / User@123   (ROLE_USER)   — can only view products
 * 2. A set of sample products across various categories
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedProducts();
    }

    private void seedUsers() {
        // Admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@shopwise.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFullName("Admin User");
            admin.setRole(User.Role.ROLE_ADMIN);
            admin.setAvatarUrl("https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff");
            admin.setBio("ShopWise platform administrator with full access to manage products and users.");
            admin.setPhone("+91-9876543210");
            userRepository.save(admin);
            log.info("Created admin user: admin / Admin@123");
        }

        // Regular user
        if (!userRepository.existsByUsername("user")) {
            User regularUser = new User();
            regularUser.setUsername("user");
            regularUser.setEmail("user@shopwise.com");
            regularUser.setPassword(passwordEncoder.encode("User@123"));
            regularUser.setFullName("Regular User");
            regularUser.setRole(User.Role.ROLE_USER);
            regularUser.setAvatarUrl("https://ui-avatars.com/api/?name=Regular+User&background=10b981&color=fff");
            regularUser.setBio("Shopper on ShopWise. I love discovering great deals!");
            regularUser.setPhone("+91-9123456789");
            userRepository.save(regularUser);
            log.info("Created regular user: user / User@123");
        }
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;

        Object[][] products = {
            // Electronics
            {"Apple iPhone 15 Pro Max", "The ultimate iPhone with titanium design, A17 Pro chip, and a 48MP main camera with 5x optical zoom.", "189999", "Electronics", "Apple", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", 50, "4.8", 1240, true},
            {"Samsung Galaxy S24 Ultra", "Galaxy AI is here. Get the most powerful Galaxy S series phone with a built-in S Pen and 200MP camera.", "134999", "Electronics", "Samsung", "https://images.unsplash.com/photo-1706439083983-1a3f26a4d3cf?w=400", 35, "4.7", 893, true},
            {"Sony WH-1000XM5 Headphones", "Industry-leading noise cancellation with 30-hour battery life and crystal-clear hands-free calling.", "29990", "Electronics", "Sony", "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", 120, "4.6", 2341, false},
            {"Apple MacBook Pro 16-inch", "Supercharged by M3 Max chip with an industry-leading 22-hour battery, Liquid Retina XDR display.", "279900", "Electronics", "Apple", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", 25, "4.9", 567, true},
            {"Dell XPS 15", "Dell XPS 15 with Intel Core i9, OLED display, and RTX 4070 GPU for creators and professionals.", "169990", "Electronics", "Dell", "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400", 40, "4.5", 412, false},
            {"iPad Pro 12.9-inch", "Supercharged by M2 chip. The ultimate iPad experience with the stunning Liquid Retina XDR display.", "112900", "Electronics", "Apple", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", 60, "4.7", 778, false},

            // Fashion
            {"Nike Air Max 270", "Nike Air Max 270 shoes feature Nike's biggest heel Air unit yet for a super-soft ride.", "12995", "Fashion", "Nike", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", 200, "4.4", 3421, true},
            {"Levi's 511 Slim Fit Jeans", "The 511 slim fit jeans sit below the waist and are slim from the hip through the thigh.", "3999", "Fashion", "Levi's", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", 350, "4.3", 2156, false},
            {"Ray-Ban Aviator Classic", "The iconic Ray-Ban Aviator Classic sunglasses with crystal green lenses and gold metal frame.", "8490", "Fashion", "Ray-Ban", "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", 180, "4.5", 1876, false},

            // Home & Kitchen
            {"Instant Pot Duo 7-in-1", "7-in-1 multi-use programmable pressure cooker, slow cooker, rice cooker, steamer, sauté pan and warmer.", "7999", "Home & Kitchen", "Instant Pot", "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400", 95, "4.6", 4521, true},
            {"Dyson V15 Detect Vacuum", "Dyson's most powerful cordless vacuum with laser dust detection and LCD screen.", "59900", "Home & Kitchen", "Dyson", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", 45, "4.7", 892, false},
            {"Philips Air Fryer XXL", "Air fry, bake, grill, roast and reheat with 7 pre-set cooking programs. Fits a whole chicken.", "12999", "Home & Kitchen", "Philips", "https://images.unsplash.com/photo-1648085386-39a3a95c7e44?w=400", 75, "4.4", 2134, false},

            // Books
            {"Atomic Habits", "No.1 New York Times bestseller. A revolutionary system to get 1% better every day by James Clear.", "399", "Books", "Penguin", "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", 500, "4.8", 12456, true},
            {"The Psychology of Money", "Timeless lessons on wealth, greed, and happiness by Morgan Housel.", "299", "Books", "Jaico", "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400", 400, "4.7", 8932, false},

            // Sports
            {"Fitbit Charge 6", "Advanced fitness tracker with built-in GPS, heart rate monitoring, and 7-day battery life.", "14999", "Sports", "Fitbit", "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400", 130, "4.3", 1567, false},
            {"Yoga Mat Premium", "Extra thick 6mm non-slip yoga mat with alignment lines, carrying strap and bag.", "2499", "Sports", "Boldfit", "https://images.unsplash.com/photo-1591291621164-2c6367723315?w=400", 280, "4.5", 3421, false},
        };

        for (Object[] p : products) {
            Product product = new Product();
            product.setName((String) p[0]);
            product.setDescription((String) p[1]);
            product.setPrice(new BigDecimal((String) p[2]));
            product.setCategory((String) p[3]);
            product.setBrand((String) p[4]);
            product.setImageUrl((String) p[5]);
            product.setStockQuantity((Integer) p[6]);
            product.setRating(new BigDecimal((String) p[7]));
            product.setReviewCount((Integer) p[8]);
            product.setFeatured((Boolean) p[9]);
            productRepository.save(product);
        }

        log.info("Seeded {} products", productRepository.count());
    }
}
