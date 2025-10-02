package com.recyconnect.controller;

import com.recyconnect.entity.Flag;
import com.recyconnect.entity.User;
import com.recyconnect.entity.DonatedItem;
import com.recyconnect.entity.ReportedItem;
import com.recyconnect.repository.FlagRepository;
import com.recyconnect.repository.UserRepository;
import com.recyconnect.repository.DonatedItemRepository;
import com.recyconnect.repository.ReportedItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/flags")
public class FlagController {

    @Autowired
    private FlagRepository flagRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonatedItemRepository donatedItemRepository;

    @Autowired
    private ReportedItemRepository reportedItemRepository;

    @PostMapping
    public ResponseEntity<?> createFlag(@RequestBody Map<String, Object> flagData) {
        try {
            System.out.println("POST /api/flags - Creating new flag: " + flagData);

            // Extract required fields
            String flagType = (String) flagData.get("flagType");
            String reason = (String) flagData.get("reason");
            String description = (String) flagData.get("description");
            Long targetId = Long.valueOf(flagData.get("targetId").toString());
            String targetType = (String) flagData.get("targetType");
            Long flaggedByUserId = Long.valueOf(flagData.get("flaggedByUserId").toString());

            // Validate required fields
            if (flagType == null || reason == null || targetId == null || targetType == null || flaggedByUserId == null) {
                return ResponseEntity.badRequest().body("Missing required fields");
            }

            // Check if user exists
            Optional<User> flaggedByUser = userRepository.findById(flaggedByUserId);
            if (!flaggedByUser.isPresent()) {
                return ResponseEntity.badRequest().body("Invalid user ID");
            }

            // Check if user has already flagged this target
            boolean alreadyFlagged = flagRepository.existsByFlaggedByIdAndTargetIdAndTargetType(
                flaggedByUserId, targetId, targetType);
            if (alreadyFlagged) {
                return ResponseEntity.badRequest().body("You have already flagged this " + targetType);
            }

            // Get flagged content for context
            String flaggedContent = getFlaggedContent(targetId, targetType);

            // Create new flag
            Flag flag = new Flag();
            flag.setFlagType(flagType);
            flag.setReason(reason);
            flag.setDescription(description);
            flag.setTargetId(targetId);
            flag.setTargetType(targetType);
            flag.setFlaggedBy(flaggedByUser.get());
            flag.setFlaggedContent(flaggedContent);

            // Set severity based on reason
            flag.setSeverity(determineSeverity(reason));

            Flag savedFlag = flagRepository.save(flag);
            
            // Set transient fields for response
            savedFlag.setFlaggedByUserId(savedFlag.getFlaggedBy().getId());
            savedFlag.setFlaggedByUserName(savedFlag.getFlaggedBy().getName());

            System.out.println("Flag created successfully: " + savedFlag.getId());
            return ResponseEntity.ok(savedFlag);

        } catch (Exception e) {
            System.err.println("Error creating flag: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error creating flag: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Flag>> getAllFlags(@RequestParam(required = false) String status,
                                                 @RequestParam(required = false) String flagType,
                                                 @RequestParam(required = false) String severity) {
        try {
            System.out.println("GET /api/flags - Fetching flags with filters: status=" + status + 
                             ", flagType=" + flagType + ", severity=" + severity);

            List<Flag> flags;

            if (status != null && severity != null) {
                flags = flagRepository.findByStatusAndSeverityOrderByCreatedAtDesc(status, severity);
            } else if (status != null) {
                flags = flagRepository.findByStatus(status);
            } else if (flagType != null) {
                flags = flagRepository.findByFlagType(flagType);
            } else if (severity != null) {
                flags = flagRepository.findBySeverity(severity);
            } else {
                // Get pending flags by priority
                flags = flagRepository.findPendingFlagsByPriority();
            }

            // Set transient fields for all flags
            for (Flag flag : flags) {
                flag.setFlaggedByUserId(flag.getFlaggedBy().getId());
                flag.setFlaggedByUserName(flag.getFlaggedBy().getName());
                if (flag.getReviewedByAdmin() != null) {
                    flag.setReviewedByAdminId(flag.getReviewedByAdmin().getId());
                    flag.setReviewedByAdminName(flag.getReviewedByAdmin().getName());
                }
            }

            System.out.println("Found " + flags.size() + " flags");
            return ResponseEntity.ok(flags);

        } catch (Exception e) {
            System.err.println("Error fetching flags: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Flag>> getUserFlags(@PathVariable Long userId) {
        try {
            System.out.println("GET /api/flags/user/" + userId + " - Fetching user's flags");

            List<Flag> flags = flagRepository.findByFlaggedBy_Id(userId);

            // Set transient fields
            for (Flag flag : flags) {
                flag.setFlaggedByUserId(flag.getFlaggedBy().getId());
                flag.setFlaggedByUserName(flag.getFlaggedBy().getName());
            }

            System.out.println("Found " + flags.size() + " flags for user " + userId);
            return ResponseEntity.ok(flags);

        } catch (Exception e) {
            System.err.println("Error fetching user flags: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/target/{targetType}/{targetId}")
    public ResponseEntity<List<Flag>> getTargetFlags(@PathVariable String targetType, 
                                                    @PathVariable Long targetId) {
        try {
            System.out.println("GET /api/flags/target/" + targetType + "/" + targetId + " - Fetching target flags");

            List<Flag> flags = flagRepository.findByTargetIdAndTargetType(targetId, targetType);

            // Set transient fields
            for (Flag flag : flags) {
                flag.setFlaggedByUserId(flag.getFlaggedBy().getId());
                flag.setFlaggedByUserName(flag.getFlaggedBy().getName());
                if (flag.getReviewedByAdmin() != null) {
                    flag.setReviewedByAdminId(flag.getReviewedByAdmin().getId());
                    flag.setReviewedByAdminName(flag.getReviewedByAdmin().getName());
                }
            }

            System.out.println("Found " + flags.size() + " flags for " + targetType + " " + targetId);
            return ResponseEntity.ok(flags);

        } catch (Exception e) {
            System.err.println("Error fetching target flags: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateFlag(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            System.out.println("PATCH /api/flags/" + id + " - Updating flag: " + updates);

            Optional<Flag> optionalFlag = flagRepository.findById(id);
            if (!optionalFlag.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Flag flag = optionalFlag.get();

            // Update allowed fields
            if (updates.containsKey("status")) {
                flag.setStatus((String) updates.get("status"));
            }
            if (updates.containsKey("severity")) {
                flag.setSeverity((String) updates.get("severity"));
            }
            if (updates.containsKey("adminNotes")) {
                flag.setAdminNotes((String) updates.get("adminNotes"));
            }
            if (updates.containsKey("reviewedByAdminId")) {
                Long adminId = Long.valueOf(updates.get("reviewedByAdminId").toString());
                Optional<User> admin = userRepository.findById(adminId);
                if (admin.isPresent()) {
                    flag.setReviewedByAdmin(admin.get());
                }
            }

            flag.setUpdatedAt(LocalDateTime.now());
            Flag savedFlag = flagRepository.save(flag);

            // Set transient fields for response
            savedFlag.setFlaggedByUserId(savedFlag.getFlaggedBy().getId());
            savedFlag.setFlaggedByUserName(savedFlag.getFlaggedBy().getName());
            if (savedFlag.getReviewedByAdmin() != null) {
                savedFlag.setReviewedByAdminId(savedFlag.getReviewedByAdmin().getId());
                savedFlag.setReviewedByAdminName(savedFlag.getReviewedByAdmin().getName());
            }

            System.out.println("Flag updated successfully: " + savedFlag.getId());
            return ResponseEntity.ok(savedFlag);

        } catch (Exception e) {
            System.err.println("Error updating flag: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error updating flag: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlag(@PathVariable Long id) {
        try {
            System.out.println("DELETE /api/flags/" + id + " - Deleting flag");

            if (flagRepository.existsById(id)) {
                flagRepository.deleteById(id);
                System.out.println("Flag deleted successfully: " + id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            System.err.println("Error deleting flag: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count/{targetType}/{targetId}")
    public ResponseEntity<Map<String, Long>> getFlagCounts(@PathVariable String targetType, 
                                                          @PathVariable Long targetId) {
        try {
            Long totalFlags = flagRepository.countFlagsForTarget(targetId, targetType);
            Long pendingFlags = flagRepository.countPendingFlagsForTarget(targetId, targetType);

            Map<String, Long> counts = Map.of(
                "total", totalFlags,
                "pending", pendingFlags
            );

            return ResponseEntity.ok(counts);

        } catch (Exception e) {
            System.err.println("Error getting flag counts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper method to get flagged content for context
    private String getFlaggedContent(Long targetId, String targetType) {
        try {
            switch (targetType.toLowerCase()) {
                case "item":
                case "donated_item":
                    Optional<DonatedItem> donatedItem = donatedItemRepository.findById(targetId);
                    return donatedItem.map(DonatedItem::getTitle).orElse("Unknown Item");
                
                case "reported_item":
                case "lost_item":
                case "found_item":
                    Optional<ReportedItem> reportedItem = reportedItemRepository.findById(targetId);
                    return reportedItem.map(ReportedItem::getTitle).orElse("Unknown Item");
                
                case "user":
                    Optional<User> user = userRepository.findById(targetId);
                    return user.map(u -> u.getName() + " (" + u.getEmail() + ")").orElse("Unknown User");
                
                default:
                    return "Unknown Content";
            }
        } catch (Exception e) {
            return "Content Not Found";
        }
    }

    // Helper method to determine severity based on reason
    private String determineSeverity(String reason) {
        switch (reason.toUpperCase()) {
            case "FRAUD":
            case "HARASSMENT":
                return "CRITICAL";
            case "INAPPROPRIATE":
            case "SPAM":
                return "HIGH";
            case "MISLEADING":
                return "MEDIUM";
            case "OTHER":
            default:
                return "LOW";
        }
    }
}