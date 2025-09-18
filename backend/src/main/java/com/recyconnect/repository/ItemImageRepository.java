package com.recyconnect.repository;

import com.recyconnect.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemImageRepository extends JpaRepository<ItemImage, Long> {
    List<ItemImage> findByItemId(Long itemId);
    List<ItemImage> findByItemIdAndIsPrimary(Long itemId, boolean isPrimary);
}
