package com.recyconnect.repository;

import com.recyconnect.entity.ReportedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportedItemRepository extends JpaRepository<ReportedItem, Long> {
    List<ReportedItem> findByReportedBy_Id(Long userId);
    List<ReportedItem> findByStatus(String status);
    List<ReportedItem> findByCategory(String category);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE reported_items SET status = :status, is_resolved = :isResolved, updated_at = :updatedAt WHERE id = :id", nativeQuery = true)
    int updateStatusAndResolved(@Param("id") Long id, @Param("status") String status, @Param("isResolved") Boolean isResolved, @Param("updatedAt") LocalDateTime updatedAt);
}