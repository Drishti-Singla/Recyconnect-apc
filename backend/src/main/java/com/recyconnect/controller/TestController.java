package com.recyconnect.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend is running");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        System.out.println("Health check endpoint called successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cors")
    public ResponseEntity<Map<String, String>> corsTest() {
        Map<String, String> response = new HashMap<>();
        response.put("cors", "working");
        response.put("message", "CORS configuration is correct");
        System.out.println("CORS test endpoint called successfully");
        return ResponseEntity.ok(response);
    }
}