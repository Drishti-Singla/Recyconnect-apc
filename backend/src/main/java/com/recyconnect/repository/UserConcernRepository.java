package com.recyconnect.repository;

import com.recyconnect.entity.UserConcern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserConcernRepository extends JpaRepository<UserConcern, Long> {
    List<UserConcern> findBySubmittedBy_Id(Long userId);
    List<UserConcern> findByStatus(String status);
    List<UserConcern> findByUrgency(String urgency);
    List<UserConcern> findBySubmittedBy_IdOrderByCreatedDateDesc(Long userId);
}