
package com.recyconnect.controller;

import com.recyconnect.entity.User;
import com.recyconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

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
                
                // Check if old password matches
                if (!user.getPassword().equals(oldPassword)) {
                    Map<String, String> response = new HashMap<>();
                    response.put("error", "Current password is incorrect");
                    return ResponseEntity.badRequest().body(response);
                }
                
                // Update password
                user.setPassword(newPassword);
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
            userRepository.deleteById(id);
            System.out.println("User deleted with ID: " + id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error in deleteUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            System.out.println("GET /api/users - Found " + users.size() + " users");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error in getAllUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            System.out.println("POST /api/users - Creating user: " + user.getName() + " (" + user.getEmail() + ")");
            // Generate random collegeId if not set
            if (user.getCollegeId() == null || user.getCollegeId().isEmpty()) {
                String randomCollegeId = generateCollegeId();
                user.setCollegeId(randomCollegeId);
            }
            User savedUser = userRepository.save(user);
            System.out.println("User created successfully with ID: " + savedUser.getId());
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
            System.out.println("Request body: " + loginRequest);
            
            if (email == null || password == null) {
                System.out.println("Login failed - Missing email or password");
                return ResponseEntity.badRequest().body("Email and password are required");
            }
            
            // Find user by email
            User user = userRepository.findByEmail(email);
            
            if (user == null) {
                System.out.println("Login failed - User not found: " + email);
                System.out.println("Available users in database:");
                List<User> allUsers = userRepository.findAll();
                for (User u : allUsers) {
                    System.out.println("  - " + u.getEmail() + " (ID: " + u.getId() + ")");
                }
                return ResponseEntity.badRequest().body("Invalid email or password");
            }
            
            // Check password (Note: In production, you should hash passwords!)
            System.out.println("Found user: " + user.getEmail() + ", checking password...");
            System.out.println("Stored password: " + user.getPassword());
            System.out.println("Provided password: " + password);
            
            if (!password.equals(user.getPassword())) {
                System.out.println("Login failed - Wrong password for: " + email);
                return ResponseEntity.badRequest().body("Invalid email or password");
            }
            
            System.out.println("Login successful for: " + email);
            
            // Return user data (without password)
            User responseUser = new User();
            responseUser.setId(user.getId());
            responseUser.setName(user.getName());
            responseUser.setEmail(user.getEmail());
            responseUser.setRole(user.getRole());
            
            return ResponseEntity.ok(responseUser);
            
        } catch (Exception e) {
            System.err.println("Error in loginUser: " + e.getMessage());
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
            System.out.println("Updated data: " + updatedUser.getName() + " (" + updatedUser.getEmail() + ")");
            
            return userRepository.findById(id)
                .map(existingUser -> {
                    // Update fields
                    if (updatedUser.getName() != null) {
                        existingUser.setName(updatedUser.getName());
                    }
                    if (updatedUser.getEmail() != null) {
                        existingUser.setEmail(updatedUser.getEmail());
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

                    // Return user without password
                    User responseUser = new User();
                    responseUser.setId(savedUser.getId());
                    responseUser.setName(savedUser.getName());
                    responseUser.setEmail(savedUser.getEmail());
                    responseUser.setRole(savedUser.getRole());
                    responseUser.setPhone(savedUser.getPhone());

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
