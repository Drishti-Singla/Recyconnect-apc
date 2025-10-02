package com.recyconnect.repository;

import com.recyconnect.entity.DonatedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonatedItemRepository extends JpaRepository<DonatedItem, Long> {
    List<DonatedItem> findByDonor_Id(Long userId);
    // List<DonatedItem> findByStatus(String status); // Status field commented out
    List<DonatedItem> findByCategory(String category);
    // List<DonatedItem> findByStatusAndCategory(String status, String category); // Status field commented out
}