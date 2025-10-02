package com.recyconnect.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "flags")
public class Flag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String flagType; // ITEM, USER, MESSAGE, CONCERN

    @Column(nullable = false)
    private String reason; // INAPPROPRIATE, SPAM, FRAUD, HARASSMENT, MISLEADING, OTHER

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String status; // PENDING, REVIEWED, RESOLVED, DISMISSED

    @Column(name = "target_id", nullable = false)
    private Long targetId; // ID of the flagged entity

    @Column(name = "target_type", nullable = false)
    private String targetType; // item, user, message, concern

    @Column(name = "flagged_content")
    private String flaggedContent; // Title or relevant content for context

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "admin_notes", length = 1000)
    private String adminNotes;

    @Column(name = "severity")
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @ManyToOne
    @JoinColumn(name = "flagged_by_user_id", nullable = false)
    @JsonIgnore
    private User flaggedBy;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_admin_id")
    @JsonIgnore
    private User reviewedByAdmin;

    // Transient fields for API responses
    @Transient
    private Long flaggedByUserId;

    @Transient
    private String flaggedByUserName;

    @Transient
    private Long reviewedByAdminId;

    @Transient
    private String reviewedByAdminName;

    // Default constructor
    public Flag() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
        this.severity = "MEDIUM";
    }

    // Constructor with basic fields
    public Flag(String flagType, String reason, String description, Long targetId, String targetType, User flaggedBy) {
        this();
        this.flagType = flagType;
        this.reason = reason;
        this.description = description;
        this.targetId = targetId;
        this.targetType = targetType;
        this.flaggedBy = flaggedBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFlagType() {
        return flagType;
    }

    public void setFlagType(String flagType) {
        this.flagType = flagType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        if ("RESOLVED".equals(status) || "DISMISSED".equals(status)) {
            this.resolvedAt = LocalDateTime.now();
        }
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getFlaggedContent() {
        return flaggedContent;
    }

    public void setFlaggedContent(String flaggedContent) {
        this.flaggedContent = flaggedContent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public User getFlaggedBy() {
        return flaggedBy;
    }

    public void setFlaggedBy(User flaggedBy) {
        this.flaggedBy = flaggedBy;
    }

    public User getReviewedByAdmin() {
        return reviewedByAdmin;
    }

    public void setReviewedByAdmin(User reviewedByAdmin) {
        this.reviewedByAdmin = reviewedByAdmin;
    }

    // Transient getters and setters
    public Long getFlaggedByUserId() {
        return this.flaggedBy != null ? this.flaggedBy.getId() : this.flaggedByUserId;
    }

    public void setFlaggedByUserId(Long flaggedByUserId) {
        this.flaggedByUserId = flaggedByUserId;
    }

    public String getFlaggedByUserName() {
        return this.flaggedBy != null ? this.flaggedBy.getName() : this.flaggedByUserName;
    }

    public void setFlaggedByUserName(String flaggedByUserName) {
        this.flaggedByUserName = flaggedByUserName;
    }

    public Long getReviewedByAdminId() {
        return this.reviewedByAdmin != null ? this.reviewedByAdmin.getId() : this.reviewedByAdminId;
    }

    public void setReviewedByAdminId(Long reviewedByAdminId) {
        this.reviewedByAdminId = reviewedByAdminId;
    }

    public String getReviewedByAdminName() {
        return this.reviewedByAdmin != null ? this.reviewedByAdmin.getName() : this.reviewedByAdminName;
    }

    public void setReviewedByAdminName(String reviewedByAdminName) {
        this.reviewedByAdminName = reviewedByAdminName;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Flag{" +
                "id=" + id +
                ", flagType='" + flagType + '\'' +
                ", reason='" + reason + '\'' +
                ", status='" + status + '\'' +
                ", targetId=" + targetId +
                ", targetType='" + targetType + '\'' +
                ", severity='" + severity + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}