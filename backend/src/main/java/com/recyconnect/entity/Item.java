package com.recyconnect.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "items")
public class Item {
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

    @Column(nullable = false)
    private boolean verified = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User owner;

    // Transient field to return owner_id without full user object
    @Transient
    private Long ownerId;

    // Transient field to return seller name without full user object
    @Transient
    private String sellerName;

    public Long getOwnerId() {
        return this.owner != null ? this.owner.getId() : this.ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getSellerName() {
        return this.owner != null ? this.owner.getName() : this.sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    // Usage and History
    private Integer usageTime;
    private String usageTimeUnit;
    private String warranty;

    // Pricing
    private BigDecimal originalPrice;
    private BigDecimal askingPrice;

    // Availability
    private Integer quantity;
    private String pickupLocation;
    private String delivery;

    // Electronics specific
    private String batteryHealth;
    private String repairs;
    private String workingStatus;

    // Furniture specific
    private String dimensions;
    private Integer dimensionLength;
    private Integer dimensionWidth;
    private Integer dimensionHeight;
    private String dimensionUnit;
    private String material;
    private String color;

    // Urgency
    private String urgency;
    private String deadline;
    private String receipt;

    // Timestamps
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    // Relationship with images
    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ItemImage> images;

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public Integer getUsageTime() { return usageTime; }
    public void setUsageTime(Integer usageTime) { this.usageTime = usageTime; }

    public String getUsageTimeUnit() { return usageTimeUnit; }
    public void setUsageTimeUnit(String usageTimeUnit) { this.usageTimeUnit = usageTimeUnit; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public BigDecimal getAskingPrice() { return askingPrice; }
    public void setAskingPrice(BigDecimal askingPrice) { this.askingPrice = askingPrice; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDelivery() { return delivery; }
    public void setDelivery(String delivery) { this.delivery = delivery; }

    public String getBatteryHealth() { return batteryHealth; }
    public void setBatteryHealth(String batteryHealth) { this.batteryHealth = batteryHealth; }

    public String getRepairs() { return repairs; }
    public void setRepairs(String repairs) { this.repairs = repairs; }

    public String getWorkingStatus() { return workingStatus; }
    public void setWorkingStatus(String workingStatus) { this.workingStatus = workingStatus; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public Integer getDimensionLength() { return dimensionLength; }
    public void setDimensionLength(Integer dimensionLength) { this.dimensionLength = dimensionLength; }

    public Integer getDimensionWidth() { return dimensionWidth; }
    public void setDimensionWidth(Integer dimensionWidth) { this.dimensionWidth = dimensionWidth; }

    public Integer getDimensionHeight() { return dimensionHeight; }
    public void setDimensionHeight(Integer dimensionHeight) { this.dimensionHeight = dimensionHeight; }

    public String getDimensionUnit() { return dimensionUnit; }
    public void setDimensionUnit(String dimensionUnit) { this.dimensionUnit = dimensionUnit; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ItemImage> getImages() { return images; }
    public void setImages(List<ItemImage> images) { this.images = images; }
}
