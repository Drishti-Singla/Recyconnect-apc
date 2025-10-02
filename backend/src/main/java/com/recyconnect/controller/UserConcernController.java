package com.recyconnect.controller;

import com.recyconnect.entity.UserConcern;
import com.recyconnect.entity.User;
import com.recyconnect.repository.UserConcernRepository;
import com.recyconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/concerns")
public class UserConcernController {

    @Autowired
    private UserConcernRepository userConcernRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserConcern>> getAllUserConcerns(@RequestParam(required = false) String status,
                                                               @RequestParam(required = false) String urgency) {
        try {
            System.out.println("GET /api/concerns - Starting request with status: " + status + ", urgency: " + urgency);
            
            List<UserConcern> concerns;
            if (status != null && urgency != null) {
                concerns = userConcernRepository.findByStatus(status);
                concerns.retainAll(userConcernRepository.findByUrgency(urgency));
            } else if (status != null) {
                concerns = userConcernRepository.findByStatus(status);
            } else if (urgency != null) {
                concerns = userConcernRepository.findByUrgency(urgency);
            } else {
                System.out.println("Fetching all user concerns...");
                concerns = userConcernRepository.findAll();
            }
            
            System.out.println("GET /api/concerns - Found " + concerns.size() + " user concerns");
            
            // Pre-process concerns to set userId before serialization
            for (UserConcern concern : concerns) {
                if (concern.getSubmittedBy() != null) {
                    concern.setUserId(concern.getSubmittedBy().getId());
                }
                System.out.println("Concern: " + concern.getDescription() + ", Status: " + concern.getStatus() + ", UserId: " + concern.getUserId());
            }
            
            System.out.println("About to return response...");
            return ResponseEntity.ok(concerns);
        } catch (Exception e) {
            System.err.println("Error in getAllUserConcerns: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserConcern> getUserConcernById(@PathVariable Long id) {
        try {
            return userConcernRepository.findById(id)
                .map(concern -> ResponseEntity.ok(concern))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in getUserConcernById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<UserConcern> createUserConcern(@RequestBody UserConcern userConcern) {
        try {
            System.out.println("POST /api/concerns - Creating user concern: " + userConcern.getConcernType());
            System.out.println("Request userId: " + userConcern.getUserId());
            System.out.println("Request reportedBy before processing: " + userConcern.getReportedBy());
            
            // Ensure reportedBy is always set to avoid NULL constraint violation
            if (userConcern.getUserId() != null) {
                Optional<User> userOpt = userRepository.findById(userConcern.getUserId());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    userConcern.setSubmittedBy(user);
                    userConcern.setReportedBy(user.getId().intValue());
                    System.out.println("✅ Set submittedBy user: " + user.getName());
                    System.out.println("✅ Set reportedBy to: " + userConcern.getReportedBy());
                } else {
                    System.err.println("⚠️ User not found with ID: " + userConcern.getUserId() + " - using fallback reportedBy=2");
                    userConcern.setReportedBy(2); // Fallback to user ID 2
                }
            } else {
                System.err.println("⚠️ No userId provided - using fallback reportedBy=2");
                userConcern.setReportedBy(2); // Fallback to user ID 2
            }
            
            // Fix contactMethod constraint - ensure it's not empty
            if (userConcern.getContactMethod() == null || userConcern.getContactMethod().trim().isEmpty()) {
                userConcern.setContactMethod("email"); // Default to email
                System.out.println("✅ Set default contactMethod to: email");
            }
            
            System.out.println("About to save userConcern with reportedBy: " + userConcern.getReportedBy());
            UserConcern savedConcern = userConcernRepository.save(userConcern);
            System.out.println("User concern created successfully with ID: " + savedConcern.getId());
            return ResponseEntity.ok(savedConcern);
        } catch (Exception e) {
            System.err.println("Error in createUserConcern: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserConcern> updateUserConcern(@PathVariable Long id, @RequestBody UserConcern updatedConcern) {
        try {
            System.out.println("PUT /api/concerns/" + id + " - Updating user concern");
            return userConcernRepository.findById(id)
                .map(existingConcern -> {
                    existingConcern.setConcernType(updatedConcern.getConcernType());
                    existingConcern.setUserInQuestion(updatedConcern.getUserInQuestion());
                    existingConcern.setItemInvolved(updatedConcern.getItemInvolved());
                    existingConcern.setDescription(updatedConcern.getDescription());
                    existingConcern.setEvidenceFiles(updatedConcern.getEvidenceFiles());
                    existingConcern.setUrgency(updatedConcern.getUrgency());
                    existingConcern.setContactMethod(updatedConcern.getContactMethod());
                    existingConcern.setStatus(updatedConcern.getStatus());
                    existingConcern.setReportedBy(updatedConcern.getReportedBy());
                    existingConcern.setAssignedTo(updatedConcern.getAssignedTo());
                    existingConcern.setResolutionNotes(updatedConcern.getResolutionNotes());
                    existingConcern.setAdminResponse(updatedConcern.getAdminResponse());
                    existingConcern.setUpdatedAt(java.time.LocalDateTime.now());
                    if (updatedConcern.getStatus().equals("resolved") && existingConcern.getResolvedAt() == null) {
                        existingConcern.setResolvedAt(java.time.LocalDateTime.now());
                        existingConcern.setResolvedDate(java.time.LocalDateTime.now());
                    }
                    UserConcern savedConcern = userConcernRepository.save(existingConcern);
                    System.out.println("User concern updated successfully: " + savedConcern.getId());
                    return ResponseEntity.ok(savedConcern);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error in updateUserConcern: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserConcern(@PathVariable Long id) {
        try {
            if (userConcernRepository.existsById(id)) {
                userConcernRepository.deleteById(id);
                System.out.println("User concern deleted successfully: " + id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error in deleteUserConcern: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-concerns")
    public ResponseEntity<List<UserConcern>> getUserOwnConcerns() {
        try {
            System.out.println("GET /api/concerns/my-concerns - Starting request");
            // For now, return all concerns since we don't have authentication context
            // In a real app, you'd get the current user from security context
            List<UserConcern> concerns = userConcernRepository.findAll();
            
            System.out.println("GET /api/concerns/my-concerns - Found " + concerns.size() + " user concerns");
            
            // Pre-process concerns to set userId before serialization
            for (UserConcern concern : concerns) {
                if (concern.getSubmittedBy() != null) {
                    concern.setUserId(concern.getSubmittedBy().getId());
                }
                System.out.println("User concern: " + concern.getConcernType() + ", UserId: " + concern.getUserId());
            }
            
            System.out.println("About to return user concerns response...");
            return ResponseEntity.ok(concerns);
        } catch (Exception e) {
            System.err.println("Error in getUserOwnConcerns: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}