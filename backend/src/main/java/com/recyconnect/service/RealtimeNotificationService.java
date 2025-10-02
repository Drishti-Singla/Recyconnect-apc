package com.recyconnect.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RealtimeNotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendDashboardUpdate(String type, Object data) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("data", data);
        message.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSend("/topic/dashboard-updates", message);
    }

    public void sendUserUpdate(Object user) {
        sendDashboardUpdate("USER_UPDATE", user);
    }

    public void sendItemUpdate(String itemType, Object item) {
        sendDashboardUpdate(itemType + "_UPDATE", item);
    }

    public void sendFlagUpdate(Object flag) {
        sendDashboardUpdate("FLAG_UPDATE", flag);
    }

    public void sendConcernUpdate(Object concern) {
        sendDashboardUpdate("CONCERN_UPDATE", concern);
    }

    public void sendDashboardStatsUpdate(Map<String, Object> stats) {
        sendDashboardUpdate("STATS_UPDATE", stats);
    }
}