package com.recyconnect.repository;

import com.recyconnect.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByCategory(String category);
    List<Item> findByCondition(String condition);
    List<Item> findByOwner_Id(Long ownerId);
}
