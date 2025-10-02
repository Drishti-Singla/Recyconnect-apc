package com.recyconnect.controller;

import com.recyconnect.entity.DonatedItem;
import com.recyconnect.entity.User;
import com.recyconnect.repository.DonatedItemRepository;
import com.recyconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/donated-items")
public class DonatedItemController {

    @Autowired
    private DonatedItemRepository donatedItemRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<DonatedItem>> getAllDonatedItems(@RequestParam(required = false) String category) {
        try {
            System.out.println("GET /api/donated-items - Starting request with category: " + category);
            
            List<DonatedItem> items;
            if (category != null) {
                items = donatedItemRepository.findByCategory(category);
            } else {
                System.out.println("Fetching all donated items...");
                items = donatedItemRepository.findAll();
            }
            
            System.out.println("GET /api/donated-items - Found " + items.size() + " donated items");
            
            // Pre-process items to set donorId and donorName before serialization
            for (DonatedItem item : items) {
                if (item.getDonor() != null) {
                    item.setDonorId(item.getDonor().getId());
                    item.setDonorName(item.getDonor().getName());
                }
                if (item.getUser() != null) {
                    item.setUserId(item.getUser().getId());
                }
                System.out.println("Item: " + item.getTitle() + ", DonorId: " + item.getDonorId());
            }
            
            System.out.println("About to return response...");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error in getAllDonatedItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonatedItem> getDonatedItemById(@PathVariable Long id) {
        try {
            return donatedItemRepository.findById(id)
                .map(item -> ResponseEntity.ok(item))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in getDonatedItemById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createDonatedItem(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("POST /api/donated-items - Creating donated item");
            
            // Extract userId from payload
            Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : null;
            if (userId == null) {
                return ResponseEntity.badRequest().body("Missing userId");
            }
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();
            
            DonatedItem donatedItem = new DonatedItem();
            donatedItem.setTitle(payload.get("title").toString());
            donatedItem.setDescription(payload.get("description").toString());
            donatedItem.setCategory(payload.get("category").toString());
            donatedItem.setCondition(payload.get("condition").toString());
            donatedItem.setPickupLocation(payload.get("pickupLocation").toString());
            
            // Set estimated value if provided
            if (payload.get("estimatedValue") != null) {
                donatedItem.setEstimatedValue(new BigDecimal(payload.get("estimatedValue").toString()));
            }
            
            // Set the donation timestamp
            donatedItem.setDonatedDate(LocalDateTime.now());
            
            // Set both donor and user to the same user (required by database schema)
            donatedItem.setDonor(user);
            donatedItem.setUser(user);
            
            DonatedItem savedItem = donatedItemRepository.save(donatedItem);
            System.out.println("Donated item created successfully with ID: " + savedItem.getId());
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            System.err.println("Error in createDonatedItem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonatedItem> updateDonatedItem(@PathVariable Long id, @RequestBody DonatedItem updatedItem) {
        try {
            System.out.println("PUT /api/donated-items/" + id + " - Updating donated item");
            return donatedItemRepository.findById(id)
                .map(existingItem -> {
                    existingItem.setTitle(updatedItem.getTitle());
                    existingItem.setDescription(updatedItem.getDescription());
                    existingItem.setCategory(updatedItem.getCategory());
                    existingItem.setCondition(updatedItem.getCondition());
                    // existingItem.setStatus(updatedItem.getStatus()); // Status column doesn't exist yet
                    existingItem.setEstimatedValue(updatedItem.getEstimatedValue());
                    
                    // Ensure pickup location is never null
                    String pickupLocation = updatedItem.getPickupLocation();
                    if (pickupLocation == null || pickupLocation.trim().isEmpty()) {
                        pickupLocation = existingItem.getPickupLocation(); // Keep existing location
                        if (pickupLocation == null || pickupLocation.trim().isEmpty()) {
                            pickupLocation = "Not specified"; // Fallback
                        }
                    }
                    existingItem.setPickupLocation(pickupLocation);
                    
                    existingItem.setClaimedBy(updatedItem.getClaimedBy());
                    // if (updatedItem.getStatus().equals("CLAIMED") && existingItem.getClaimedDate() == null) {
                    //     existingItem.setClaimedDate(java.time.LocalDateTime.now());
                    // }
                    DonatedItem savedItem = donatedItemRepository.save(existingItem);
                    System.out.println("Donated item updated successfully: " + savedItem.getId());
                    return ResponseEntity.ok(savedItem);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in updateDonatedItem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonatedItem(@PathVariable Long id) {
        try {
            if (donatedItemRepository.existsById(id)) {
                donatedItemRepository.deleteById(id);
                System.out.println("Donated item deleted successfully: " + id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error in deleteDonatedItem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<DonatedItem>> getUserDonatedItems() {
        try {
            System.out.println("GET /api/donated-items/user - Starting request");
            // For now, return all donated items since we don't have authentication context
            // In a real app, you'd get the current user from security context
            List<DonatedItem> items = donatedItemRepository.findAll();
            
            System.out.println("GET /api/donated-items/user - Found " + items.size() + " user donated items");
            
            // Pre-process items to set donorId before serialization
            for (DonatedItem item : items) {
                if (item.getDonor() != null) {
                    item.setDonorId(item.getDonor().getId());
                }
                System.out.println("User donated item: " + item.getTitle() + ", DonorId: " + item.getDonorId());
            }
            
            System.out.println("About to return user donated items response...");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error in getUserDonatedItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}