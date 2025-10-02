package com.recyconnect;

import com.recyconnect.entity.User;
import com.recyconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if not exists
        String adminEmail = "admin@chitkara.edu.in";
        if (!userRepository.existsByEmail(adminEmail)) {
            User adminUser = new User();
            adminUser.setEmail(adminEmail);
            adminUser.setName("Administrator");
            adminUser.setPassword(passwordEncoder.encode("admin@1234"));
            adminUser.setRole("ADMIN");
            adminUser.setPhone("9999999999");
            adminUser.setBio("System Administrator");
            
            userRepository.save(adminUser);
            System.out.println("✅ Admin user created: " + adminEmail);
        } else {
            System.out.println("ℹ️ Admin user already exists: " + adminEmail);
        }
    }
}
