package com.recyconnect.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "user_concerns")
public class UserConcern {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "concern_type")
    private String concernType;

    @Column(name = "user_in_question")
    private String userInQuestion;

    @Column(name = "item_involved")
    private String itemInvolved;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(name = "evidence_files", columnDefinition = "text")
    @JsonProperty("evidenceFiles")
    private String evidenceFiles;

    private String urgency; // high, medium, low

    @Column(name = "contact_method")
    private String contactMethod;

    private String status; // pending, in_progress, resolved

    @Column(name = "reported_by")
    private Integer reportedBy;

    @Column(name = "assigned_to")
    private Integer assignedTo;

    @Column(name = "resolution_notes")
    private String resolutionNotes;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(length = 1000, name = "admin_response")
    private String adminResponse;

    @PrePersist
    public void prePersist() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Column(name = "resolved_date")
    private LocalDateTime resolvedDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User submittedBy;

    // Transient field to return user_id without full user object
    @Transient
    private Long userId;

    public Long getUserId() {
        return this.submittedBy != null ? this.submittedBy.getId() : this.userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Default constructor
    public UserConcern() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConcernType() {
        return concernType;
    }

    public void setConcernType(String concernType) {
        this.concernType = concernType;
    }

    public String getUserInQuestion() {
        return userInQuestion;
    }

    public void setUserInQuestion(String userInQuestion) {
        this.userInQuestion = userInQuestion;
    }

    public String getItemInvolved() {
        return itemInvolved;
    }

    public void setItemInvolved(String itemInvolved) {
        this.itemInvolved = itemInvolved;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEvidenceFiles() {
        return evidenceFiles;
    }

    public void setEvidenceFiles(String evidenceFiles) {
        this.evidenceFiles = evidenceFiles;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public String getContactMethod() {
        return contactMethod;
    }

    public void setContactMethod(String contactMethod) {
        this.contactMethod = contactMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(Integer reportedBy) {
        this.reportedBy = reportedBy;
    }

    public Integer getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Integer assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
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

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }

    public LocalDateTime getResolvedDate() {
        return resolvedDate;
    }

    public void setResolvedDate(LocalDateTime resolvedDate) {
        this.resolvedDate = resolvedDate;
    }

    public User getSubmittedBy() {
        return submittedBy;
    }

    public void setSubmittedBy(User submittedBy) {
        this.submittedBy = submittedBy;
    }
}