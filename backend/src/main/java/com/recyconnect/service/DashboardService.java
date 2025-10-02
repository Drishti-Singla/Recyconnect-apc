package com.recyconnect.service;

import com.recyconnect.repository.UserRepository;
import com.recyconnect.repository.DonatedItemRepository;
import com.recyconnect.repository.ReportedItemRepository;
import com.recyconnect.repository.UserConcernRepository;
import com.recyconnect.repository.FlagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonatedItemRepository donatedItemRepository;

    @Autowired
    private ReportedItemRepository reportedItemRepository;

    @Autowired
    private UserConcernRepository userConcernRepository;

    @Autowired
    private FlagRepository flagRepository;

    @Autowired
    private RealtimeNotificationService notificationService;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Count actual users (exclude deleted ones)
        long userCount = userRepository.findAll().stream()
                .filter(user -> !user.getRole().equals("DELETED"))
                .count();
        
        stats.put("users", userCount);
        stats.put("donatedItems", donatedItemRepository.count());
        stats.put("reportedItems", reportedItemRepository.count());
        stats.put("concerns", userConcernRepository.count());
        stats.put("flags", flagRepository.count());
        
        return stats;
    }

    public void broadcastDashboardUpdate() {
        Map<String, Object> stats = getDashboardStats();
        notificationService.sendDashboardStatsUpdate(stats);
    }
}