package com.recyconnect.controller;

import com.recyconnect.entity.ReportedItem;
import com.recyconnect.entity.User;
import com.recyconnect.repository.ReportedItemRepository;
import com.recyconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reported")
public class ReportedItemController {

    @Autowired
    private ReportedItemRepository reportedItemRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ReportedItem>> getAllReportedItems(@RequestParam(required = false) String status,
                                                                 @RequestParam(required = false) String category) {
        try {
            System.out.println("GET /api/reported - Starting request with status: " + status + ", category: " + category);
            
            List<ReportedItem> items;
            if (status != null && category != null) {
                items = reportedItemRepository.findByStatus(status);
                items.retainAll(reportedItemRepository.findByCategory(category));
            } else if (status != null) {
                items = reportedItemRepository.findByStatus(status);
            } else if (category != null) {
                items = reportedItemRepository.findByCategory(category);
            } else {
                System.out.println("Fetching all reported items...");
                items = reportedItemRepository.findAll();
            }
            
            System.out.println("GET /api/reported - Found " + items.size() + " reported items");
            
            // Pre-process items to set userId before serialization
            for (ReportedItem item : items) {
                if (item.getReportedBy() != null) {
                    item.setUserId(item.getReportedBy().getId());
                }
                System.out.println("Item: " + item.getTitle() + ", Type: " + item.getItemType() + ", Status: " + item.getStatus() + ", UserId: " + item.getUserId());
            }
            
            System.out.println("About to return response...");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error in getAllReportedItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportedItem> getReportedItemById(@PathVariable Long id) {
        try {
            return reportedItemRepository.findById(id)
                .map(item -> ResponseEntity.ok(item))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in getReportedItemById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<ReportedItem> createReportedItem(@RequestBody ReportedItem reportedItem) {
        try {
            System.out.println("POST /api/reported - Creating reported item: " + reportedItem.getTitle());
            System.out.println("Received data - Category: " + reportedItem.getCategory());
            System.out.println("Received data - Description: " + reportedItem.getDescription());
            System.out.println("Received data - Item Type: " + reportedItem.getItemType());
            System.out.println("Received data - Status: " + reportedItem.getStatus());
            
            // Set timestamps
            LocalDateTime now = LocalDateTime.now();
            reportedItem.setReportedDate(now);
            reportedItem.setUpdatedAt(now);
            
            // Set default status if not provided
            if (reportedItem.getStatus() == null || reportedItem.getStatus().trim().isEmpty()) {
                reportedItem.setStatus("active");
                System.out.println("Set default status to: active");
            }
            
            // Set default isResolved if not provided
            if (reportedItem.getIsResolved() == null) {
                reportedItem.setIsResolved(false);
                System.out.println("Set default isResolved to: false");
            }
            
            // Handle user association - for now using a default user (ID: 2)
            // In a real app, this would come from the authentication context
            if (reportedItem.getReportedBy() == null) {
                Optional<User> user = userRepository.findById(2L);
                if (user.isPresent()) {
                    reportedItem.setReportedBy(user.get());
                    System.out.println("Set reportedBy user to ID: 2");
                } else {
                    System.err.println("Warning: Could not find user with ID 2 for reportedBy");
                }
            }
            
            System.out.println("About to save reported item...");
            ReportedItem savedItem = reportedItemRepository.save(reportedItem);
            System.out.println("Reported item created successfully with ID: " + savedItem.getId());
            return ResponseEntity.ok(savedItem);
        } catch (Exception e) {
            System.err.println("Error in createReportedItem: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getSimpleName());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReportedItem> updateReportedItem(@PathVariable Long id, @RequestBody ReportedItem updatedItem) {
        try {
            System.out.println("PUT /api/reported/" + id + " - Updating reported item");
            return reportedItemRepository.findById(id)
                .map(existingItem -> {
                    existingItem.setTitle(updatedItem.getTitle());
                    existingItem.setDescription(updatedItem.getDescription());
                    existingItem.setCategory(updatedItem.getCategory());
                    existingItem.setColor(updatedItem.getColor());
                    existingItem.setBrand(updatedItem.getBrand());
                    existingItem.setLocationLost(updatedItem.getLocationLost());
                    existingItem.setLocationFound(updatedItem.getLocationFound());
                    existingItem.setCurrentLocation(updatedItem.getCurrentLocation());
                    existingItem.setDateLost(updatedItem.getDateLost());
                    existingItem.setDateFound(updatedItem.getDateFound());
                    existingItem.setTimeLost(updatedItem.getTimeLost());
                    existingItem.setTimeFound(updatedItem.getTimeFound());
                    existingItem.setContactInfo(updatedItem.getContactInfo());
                    existingItem.setImage(updatedItem.getImage());
                    existingItem.setStatus(updatedItem.getStatus());
                    existingItem.setIsResolved(updatedItem.getIsResolved());
                    existingItem.setItemType(updatedItem.getItemType());
                    existingItem.setUpdatedAt(java.time.LocalDateTime.now());
                    ReportedItem savedItem = reportedItemRepository.save(existingItem);
                    System.out.println("Reported item updated successfully: " + savedItem.getId());
                    return ResponseEntity.ok(savedItem);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in updateReportedItem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ReportedItem> updateReportedItemStatus(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            System.out.println("PATCH /api/reported/" + id + " - Updating reported item status: " + updates);
            return reportedItemRepository.findById(id)
                .map(existingItem -> {
                    // Update only the provided fields
                    if (updates.containsKey("status")) {
                        String frontendStatus = (String) updates.get("status");
                        System.out.println("Frontend requested status: " + frontendStatus);
                        
                        // Map frontend status to database status
                        String dbStatus;
                        boolean isResolved;
                        
                        if ("verified".equals(frontendStatus)) {
                            // "verified" is a frontend concept - map to "active" in database
                            dbStatus = "active";
                            isResolved = false;
                        } else if ("resolved".equals(frontendStatus)) {
                            dbStatus = "resolved";
                            isResolved = true;
                        } else {
                            // For other values (like "active", "pending"), use as-is
                            dbStatus = frontendStatus;
                            isResolved = "resolved".equals(frontendStatus);
                        }
                        
                        System.out.println("Mapped to database status: " + dbStatus + ", isResolved: " + isResolved);
                        
                        // Use native query to update only specific fields
                        int updatedRows = reportedItemRepository.updateStatusAndResolved(id, dbStatus, isResolved, LocalDateTime.now());
                        
                        if (updatedRows > 0) {
                            // Fetch the updated item to return
                            ReportedItem updatedItem = reportedItemRepository.findById(id).orElse(existingItem);
                            System.out.println("Reported item status updated successfully: " + updatedItem.getId() + " to " + updatedItem.getStatus());
                            return ResponseEntity.ok(updatedItem);
                        } else {
                            System.err.println("No rows updated for reported item: " + id);
                            return ResponseEntity.status(500).body(existingItem);
                        }
                    }
                    
                    return ResponseEntity.ok(existingItem);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in updateReportedItemStatus: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReportedItem(@PathVariable Long id) {
        try {
            if (reportedItemRepository.existsById(id)) {
                reportedItemRepository.deleteById(id);
                System.out.println("Reported item deleted successfully: " + id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error in deleteReportedItem: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-reported")
    public ResponseEntity<List<ReportedItem>> getUserReportedItems() {
        try {
            System.out.println("GET /api/reported/my-reported - Starting request");
            // For now, return all reported items since we don't have authentication context
            // In a real app, you'd get the current user from security context
            List<ReportedItem> items = reportedItemRepository.findAll();
            
            System.out.println("GET /api/reported/my-reported - Found " + items.size() + " user reported items");
            
            // Pre-process items to set userId before serialization
            for (ReportedItem item : items) {
                if (item.getReportedBy() != null) {
                    item.setUserId(item.getReportedBy().getId());
                }
                System.out.println("User reported item: " + item.getTitle() + ", UserId: " + item.getUserId());
            }
            
            System.out.println("About to return user reported items response...");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error in getUserReportedItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}