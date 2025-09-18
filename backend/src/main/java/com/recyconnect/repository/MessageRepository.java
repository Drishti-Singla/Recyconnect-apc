package com.recyconnect.repository;

import com.recyconnect.entity.Message;
import com.recyconnect.entity.Item;
import com.recyconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByItem(Item item);
    List<Message> findBySender(User sender);
    List<Message> findByReceiver(User receiver);
}
