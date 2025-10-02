package com.recyconnect.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;

@Entity
@Table(name = "reported_items")
public class ReportedItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String category;

    private String color;

    private String brand;

    @Column(nullable = false, name = "item_type")
    private String itemType; // lost, found

    @Column(name = "location_lost")
    private String locationLost;

    @Column(name = "location_found")
    private String locationFound;

    @Column(name = "current_location")
    private String currentLocation;

    @Column(name = "date_lost")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate dateLost;

    @Column(name = "date_found")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate dateFound;

    @Column(name = "time_lost")
    @JsonFormat(pattern = "HH:mm")
    @JsonDeserialize(using = LocalTimeDeserializer.class)
    @JsonSerialize(using = LocalTimeSerializer.class)
    private LocalTime timeLost;

    @Column(name = "time_found")
    @JsonFormat(pattern = "HH:mm")
    @JsonDeserialize(using = LocalTimeDeserializer.class)
    @JsonSerialize(using = LocalTimeSerializer.class)
    private LocalTime timeFound;

    @Column(name = "contact_info")
    private String contactInfo;

    private String image;

    @Column(nullable = false)
    private String status; // active, resolved

    @Column(name = "is_resolved")
    private Boolean isResolved;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime reportedDate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User reportedBy;

    // Transient field to return user_id without full user object
    @Transient
    private Long userId;

    public Long getUserId() {
        return this.reportedBy != null ? this.reportedBy.getId() : this.userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Default constructor
    public ReportedItem() {}

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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getLocationLost() {
        return locationLost;
    }

    public void setLocationLost(String locationLost) {
        this.locationLost = locationLost;
    }

    public String getLocationFound() {
        return locationFound;
    }

    public void setLocationFound(String locationFound) {
        this.locationFound = locationFound;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }

    public LocalDate getDateLost() {
        return dateLost;
    }

    public void setDateLost(LocalDate dateLost) {
        this.dateLost = dateLost;
    }

    public LocalDate getDateFound() {
        return dateFound;
    }

    public void setDateFound(LocalDate dateFound) {
        this.dateFound = dateFound;
    }
    
    // Helper methods for string date handling
    @JsonIgnore
    public void setDateLostFromString(String dateLostStr) {
        if (dateLostStr != null && !dateLostStr.trim().isEmpty()) {
            try {
                this.dateLost = LocalDate.parse(dateLostStr);
            } catch (Exception e) {
                System.err.println("Error parsing date_lost: " + dateLostStr + " - " + e.getMessage());
                this.dateLost = null;
            }
        }
    }
    
    @JsonIgnore
    public void setDateFoundFromString(String dateFoundStr) {
        if (dateFoundStr != null && !dateFoundStr.trim().isEmpty()) {
            try {
                this.dateFound = LocalDate.parse(dateFoundStr);
            } catch (Exception e) {
                System.err.println("Error parsing date_found: " + dateFoundStr + " - " + e.getMessage());
                this.dateFound = null;
            }
        }
    }

    public LocalTime getTimeLost() {
        return timeLost;
    }

    public void setTimeLost(LocalTime timeLost) {
        this.timeLost = timeLost;
    }

    public LocalTime getTimeFound() {
        return timeFound;
    }

    public void setTimeFound(LocalTime timeFound) {
        this.timeFound = timeFound;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsResolved() {
        return isResolved;
    }

    public void setIsResolved(Boolean isResolved) {
        this.isResolved = isResolved;
    }

    @JsonProperty("item_type")
    public String getItemType() {
        return itemType;
    }

    @JsonProperty("item_type")
    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public LocalDateTime getReportedDate() {
        return reportedDate;
    }

    public void setReportedDate(LocalDateTime reportedDate) {
        this.reportedDate = reportedDate;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(User reportedBy) {
        this.reportedBy = reportedBy;
    }
}