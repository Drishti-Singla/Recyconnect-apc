package com.recyconnect.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "donated_items")
public class DonatedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String condition;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime donatedDate;

    // @Column(nullable = false)
    // private String status; // AVAILABLE, CLAIMED, DONATED - Column doesn't exist in DB yet

    private BigDecimal estimatedValue;

    @Column(name = "location", nullable = false)
    private String pickupLocation;

    @ManyToOne
    @JoinColumn(name = "donor_id")
    @JsonIgnore
    private User donor;

    // Add the user_id mapping that the database expects
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Transient field to return donor_id without full user object
    @Transient
    private Long donorId;

    // Transient field to return user_id without full user object
    @Transient
    private Long userId;

    // Transient field to return donor name without full user object
    @Transient
    private String donorName;

    public Long getDonorId() {
        return this.donor != null ? this.donor.getId() : this.donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public Long getUserId() {
        return this.user != null ? this.user.getId() : this.userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDonorName() {
        return this.donor != null ? this.donor.getName() : this.donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    @ManyToOne
    @JoinColumn(name = "claimed_by_id")
    private User claimedBy;

    private LocalDateTime claimedDate;

    // Default constructor
    public DonatedItem() {}

    public DonatedItem(String title, String description, String category, String condition,
                      BigDecimal estimatedValue, String pickupLocation, User donor) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.condition = condition;
        this.donatedDate = LocalDateTime.now();
        // this.status = "AVAILABLE"; // Status field commented out
        this.estimatedValue = estimatedValue;
        this.pickupLocation = pickupLocation;
        this.donor = donor;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public LocalDateTime getDonatedDate() {
        return donatedDate;
    }

    public void setDonatedDate(LocalDateTime donatedDate) {
        this.donatedDate = donatedDate;
    }

    // public String getStatus() {
    //     return status;
    // }

    // public void setStatus(String status) {
    //     this.status = status;
    // }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(BigDecimal estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public User getDonor() {
        return donor;
    }

    public void setDonor(User donor) {
        this.donor = donor;
    }

    public User getClaimedBy() {
        return claimedBy;
    }

    public void setClaimedBy(User claimedBy) {
        this.claimedBy = claimedBy;
    }

    public LocalDateTime getClaimedDate() {
        return claimedDate;
    }

    public void setClaimedDate(LocalDateTime claimedDate) {
        this.claimedDate = claimedDate;
    }
}