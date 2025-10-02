package com.recyconnect.repository;

import com.recyconnect.entity.Flag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlagRepository extends JpaRepository<Flag, Long> {
    
    // Find flags by status
    List<Flag> findByStatus(String status);
    
    // Find flags by flagged user
    List<Flag> findByFlaggedBy_Id(Long userId);
    
    // Find flags by target ID and type
    List<Flag> findByTargetIdAndTargetType(Long targetId, String targetType);
    
    // Find flags by flag type
    List<Flag> findByFlagType(String flagType);
    
    // Find flags by reason
    List<Flag> findByReason(String reason);
    
    // Find flags by severity
    List<Flag> findBySeverity(String severity);
    
    // Count pending flags for a specific target
    @Query("SELECT COUNT(f) FROM Flag f WHERE f.targetId = :targetId AND f.targetType = :targetType AND f.status = 'PENDING'")
    Long countPendingFlagsForTarget(@Param("targetId") Long targetId, @Param("targetType") String targetType);
    
    // Count total flags for a specific target
    @Query("SELECT COUNT(f) FROM Flag f WHERE f.targetId = :targetId AND f.targetType = :targetType")
    Long countFlagsForTarget(@Param("targetId") Long targetId, @Param("targetType") String targetType);
    
    // Find flags with high severity that are pending
    List<Flag> findByStatusAndSeverityOrderByCreatedAtDesc(String status, String severity);
    
    // Get flags by target type and status
    List<Flag> findByTargetTypeAndStatusOrderByCreatedAtDesc(String targetType, String status);
    
    // Get all pending flags ordered by severity and creation date
    @Query("SELECT f FROM Flag f WHERE f.status = 'PENDING' ORDER BY " +
           "CASE f.severity WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 END, " +
           "f.createdAt DESC")
    List<Flag> findPendingFlagsByPriority();
    
    // Check if user has already flagged a specific target
    @Query("SELECT COUNT(f) > 0 FROM Flag f WHERE f.flaggedBy.id = :userId AND f.targetId = :targetId AND f.targetType = :targetType")
    boolean existsByFlaggedByIdAndTargetIdAndTargetType(@Param("userId") Long userId, @Param("targetId") Long targetId, @Param("targetType") String targetType);
}