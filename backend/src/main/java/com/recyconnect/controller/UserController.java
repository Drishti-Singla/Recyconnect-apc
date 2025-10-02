package com.recyconnect.controller;

import com.recyconnect.entity.User;
import com.recyconnect.repository.UserRepository;
import com.recyconnect.service.RealtimeNotificationService;
import com.recyconnect.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @PostMapping("/{id}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordData) {
        try {
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");

            System.out.println("POST /api/users/" + id + "/change-password - Changing password");

            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Check if old password matches using BCrypt
                BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
                if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Current password is incorrect");
                    return ResponseEntity.badRequest().body(response);
                }

                // Update password with BCrypt hash
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                Map<String, String> response = new HashMap<>();
                response.put("message", "Password changed successfully");
                System.out.println("Password changed successfully for user ID: " + id);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error in changePassword: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            // For safety, we should not allow deletion of users that have associated data
            // Instead, we'll deactivate the user by setting their email to a deleted state
            // This preserves data integrity while effectively "deleting" the user
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Mark user as deleted by prefixing email with "DELETED_"
                String deletedEmail = "DELETED_" + System.currentTimeMillis() + "_" + user.getEmail();
                user.setEmail(deletedEmail);
                user.setName("DELETED USER");
                user.setRole("DELETED");
                userRepository.save(user);
                
                System.out.println("User marked as deleted with ID: " + id);
                
                // Send real-time notification
                notificationService.sendUserUpdate(user);
                dashboardService.broadcastDashboardUpdate();
                
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error in deleteUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RealtimeNotificationService notificationService;
    
    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> allUsers = userRepository.findAll();
            // Filter out deleted users
            List<User> activeUsers = allUsers.stream()
                    .filter(user -> !user.getRole().equals("DELETED"))
                    .collect(java.util.stream.Collectors.toList());
            
            System.out.println("GET /api/users - Found " + activeUsers.size() + " active users (out of " + allUsers.size() + " total)");
            return ResponseEntity.ok(activeUsers);
        } catch (Exception e) {
            System.err.println("Error in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            System.out.println("POST /api/users - Creating user: " + user.getEmail() + ")");

            // Set default role if not provided
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
            }

            // Hash the password before saving
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            user.setPassword(passwordEncoder.encode(user.getPassword()));

            User savedUser = userRepository.save(user);
            System.out.println("User created successfully with ID: " + savedUser.getId());
            
            // Send real-time notification
            notificationService.sendUserUpdate(savedUser);
            dashboardService.broadcastDashboardUpdate();
            
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            System.err.println("Error in createUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper to generate random collegeId (e.g., CTU2025XXXX)
    private String generateCollegeId() {
        String year = String.valueOf(java.time.Year.now().getValue());
        int randomNum = (int)(Math.random() * 9000) + 1000;
        return "CTU" + year + randomNum;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            System.out.println("POST /api/users/login - Login attempt for: " + email);

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.badRequest().body("Invalid email or password");
            }

            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            if (!passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body("Invalid email or password");
            }

            System.out.println("Login successful for: " + email);

            User responseUser = new User();
            responseUser.setId(user.getId());
            responseUser.setEmail(user.getEmail());
            responseUser.setName(user.getName());
            responseUser.setRole(user.getRole());

            return ResponseEntity.ok(responseUser);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Login failed");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in getUserById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            System.out.println("PUT /api/users/" + id + " - Updating user");
            System.out.println("Updated data: " + updatedUser.getEmail() + ")");
            
            return userRepository.findById(id)
                .map(existingUser -> {
                    // Update fields
                    if (updatedUser.getEmail() != null) {
                        existingUser.setEmail(updatedUser.getEmail());
                    }
                    if (updatedUser.getName() != null) {
                        existingUser.setName(updatedUser.getName());
                    }
                    if (updatedUser.getRole() != null) {
                        existingUser.setRole(updatedUser.getRole());
                    }
                    if (updatedUser.getPhone() != null) {
                        existingUser.setPhone(updatedUser.getPhone());
                    }
                    if (updatedUser.getBio() != null) {
                        existingUser.setBio(updatedUser.getBio());
                    }
                    // Don't update password here for security - would need separate endpoint

                    User savedUser = userRepository.save(existingUser);
                    System.out.println("User updated successfully: " + savedUser.getId());
                    System.out.println("Updated user name: " + savedUser.getName());
                    System.out.println("Updated user email: " + savedUser.getEmail());

                    // Send real-time notification
                    notificationService.sendUserUpdate(savedUser);
                    dashboardService.broadcastDashboardUpdate();

                    // Return user without password
                    User responseUser = new User();
                    responseUser.setId(savedUser.getId());
                    responseUser.setEmail(savedUser.getEmail());
                    responseUser.setName(savedUser.getName());
                    System.out.println("Response user name: " + responseUser.getName());
                    responseUser.setRole(savedUser.getRole());
                    responseUser.setPhone(savedUser.getPhone());
                    responseUser.setBio(savedUser.getBio());

                    return ResponseEntity.ok(responseUser);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in updateUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
