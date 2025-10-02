package com.recyconnect.controller;

import com.recyconnect.entity.Item;
import com.recyconnect.entity.ItemImage;
import com.recyconnect.entity.User;
import com.recyconnect.repository.ItemRepository;
import com.recyconnect.repository.UserRepository;
import com.recyconnect.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileUploadService fileUploadService;

    @GetMapping
    public ResponseEntity<List<Item>> getAllItems() {
        try {
            System.out.println("GET /api/items - Starting request");
            List<Item> items = itemRepository.findAll();
            
            System.out.println("GET /api/items - Found " + items.size() + " items");
            
            // Pre-process items to set ownerId before serialization
            for (Item item : items) {
                if (item.getOwner() != null) {
                    item.setOwnerId(item.getOwner().getId());
                    item.setSellerName(item.getOwner().getName());
                }
            }
            
            System.out.println("About to return all items response...");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error in getAllItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody Map<String, Object> payload) {
        try {
            // Extract userId and item fields from payload
            Long userId = payload.get("userId") != null ? Long.valueOf(payload.get("userId").toString()) : null;
            if (userId == null) {
                return ResponseEntity.badRequest().body("Missing userId");
            }
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Item item = new Item();
            item.setTitle((String) payload.get("title"));
            item.setDescription((String) payload.get("description"));
            item.setCategory((String) payload.get("category"));
            item.setCondition((String) payload.get("condition"));
            item.setOwner(user);

            // Optional fields
            if (payload.get("usageTime") != null && !payload.get("usageTime").toString().trim().isEmpty()) {
                item.setUsageTime(Integer.valueOf(payload.get("usageTime").toString()));
            }
            item.setUsageTimeUnit((String) payload.get("usageTimeUnit"));
            item.setWarranty((String) payload.get("warranty"));
            if (payload.get("originalPrice") != null && !payload.get("originalPrice").toString().trim().isEmpty()) {
                item.setOriginalPrice(new java.math.BigDecimal(payload.get("originalPrice").toString()));
            }
            if (payload.get("askingPrice") != null && !payload.get("askingPrice").toString().trim().isEmpty()) {
                item.setAskingPrice(new java.math.BigDecimal(payload.get("askingPrice").toString()));
            }
            if (payload.get("quantity") != null && !payload.get("quantity").toString().trim().isEmpty()) {
                item.setQuantity(Integer.valueOf(payload.get("quantity").toString()));
            }
            item.setPickupLocation((String) payload.get("pickupLocation"));
            item.setDelivery((String) payload.get("delivery"));
            item.setBatteryHealth((String) payload.get("batteryHealth"));
            item.setRepairs((String) payload.get("repairs"));
            item.setWorkingStatus((String) payload.get("workingStatus"));
            item.setDimensions((String) payload.get("dimensions"));
            if (payload.get("dimensionLength") != null && !payload.get("dimensionLength").toString().trim().isEmpty()) {
                item.setDimensionLength(Integer.valueOf(payload.get("dimensionLength").toString()));
            }
            if (payload.get("dimensionWidth") != null && !payload.get("dimensionWidth").toString().trim().isEmpty()) {
                item.setDimensionWidth(Integer.valueOf(payload.get("dimensionWidth").toString()));
            }
            if (payload.get("dimensionHeight") != null && !payload.get("dimensionHeight").toString().trim().isEmpty()) {
                item.setDimensionHeight(Integer.valueOf(payload.get("dimensionHeight").toString()));
            }
            item.setDimensionUnit((String) payload.get("dimensionUnit"));
            item.setMaterial((String) payload.get("material"));
            item.setColor((String) payload.get("color"));
            item.setUrgency((String) payload.get("urgency"));
            item.setDeadline((String) payload.get("deadline"));
            item.setReceipt((String) payload.get("receipt"));

            Item saved = itemRepository.save(item);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating item: " + e.getMessage());
        }
    }

    @PostMapping("/create-with-images")
    public ResponseEntity<?> createItemWithImages(
            @RequestParam("itemData") String itemDataJson,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam("userId") Long userId) {
        try {
            // Parse item data from JSON
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> itemData = objectMapper.readValue(itemDataJson, Map.class);
            
            // Find the user
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            // Create Item entity
            Item item = new Item();
            item.setTitle((String) itemData.get("title"));
            item.setDescription((String) itemData.get("description"));
            item.setCategory((String) itemData.get("category"));
            item.setCondition((String) itemData.get("condition"));
            item.setOwner(user);
            
            // Set optional fields with proper null checks
            if (itemData.get("usageTime") != null && !itemData.get("usageTime").toString().trim().isEmpty()) {
                item.setUsageTime(Integer.valueOf(itemData.get("usageTime").toString()));
            }
            item.setUsageTimeUnit((String) itemData.get("usageTimeUnit"));
            item.setWarranty((String) itemData.get("warranty"));
            
            if (itemData.get("originalPrice") != null && !itemData.get("originalPrice").toString().trim().isEmpty()) {
                item.setOriginalPrice(new BigDecimal(itemData.get("originalPrice").toString()));
            }
            if (itemData.get("askingPrice") != null && !itemData.get("askingPrice").toString().trim().isEmpty()) {
                item.setAskingPrice(new BigDecimal(itemData.get("askingPrice").toString()));
            }
            
            if (itemData.get("quantity") != null && !itemData.get("quantity").toString().trim().isEmpty()) {
                item.setQuantity(Integer.valueOf(itemData.get("quantity").toString()));
            }
            item.setPickupLocation((String) itemData.get("pickupLocation"));
            item.setDelivery((String) itemData.get("delivery"));
            
            // Electronics specific
            item.setBatteryHealth((String) itemData.get("batteryHealth"));
            item.setRepairs((String) itemData.get("repairs"));
            item.setWorkingStatus((String) itemData.get("workingStatus"));
            
            // Furniture specific
            item.setDimensions((String) itemData.get("dimensions"));
            if (itemData.get("dimensionLength") != null && !itemData.get("dimensionLength").toString().trim().isEmpty()) {
                item.setDimensionLength(Integer.valueOf(itemData.get("dimensionLength").toString()));
            }
            if (itemData.get("dimensionWidth") != null && !itemData.get("dimensionWidth").toString().trim().isEmpty()) {
                item.setDimensionWidth(Integer.valueOf(itemData.get("dimensionWidth").toString()));
            }
            if (itemData.get("dimensionHeight") != null && !itemData.get("dimensionHeight").toString().trim().isEmpty()) {
                item.setDimensionHeight(Integer.valueOf(itemData.get("dimensionHeight").toString()));
            }
            item.setDimensionUnit((String) itemData.get("dimensionUnit"));
            item.setMaterial((String) itemData.get("material"));
            item.setColor((String) itemData.get("color"));
            
            // Urgency
            item.setUrgency((String) itemData.get("urgency"));
            item.setDeadline((String) itemData.get("deadline"));
            item.setReceipt((String) itemData.get("receipt"));
            
            // Save item first
            Item savedItem = itemRepository.save(item);
            
            // Handle image uploads (temporarily disabled for testing)
            if (images != null && !images.isEmpty()) {
                try {
                    List<ItemImage> savedImages = fileUploadService.saveItemImages(images, savedItem);
                    savedItem.setImages(savedImages);
                    System.out.println("Successfully saved " + savedImages.size() + " images");
                } catch (Exception imageException) {
                    System.err.println("Error saving images: " + imageException.getMessage());
                    imageException.printStackTrace();
                    // Continue without images - don't fail the entire request
                }
            }
            
            return ResponseEntity.ok(savedItem);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating item: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Item getItemById(@PathVariable Long id) {
        return itemRepository.findById(id).orElse(null);
    }

    @GetMapping("/category/{category}")
    public List<Item> getItemsByCategory(@PathVariable String category) {
        return itemRepository.findByCategory(category);
    }

    @GetMapping("/condition/{condition}")
    public List<Item> getItemsByCondition(@PathVariable String condition) {
        return itemRepository.findByCondition(condition);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Item>> getItemsByUser(@PathVariable Long userId) {
        try {
            System.out.println("GET /api/items/user/" + userId + " - Starting request");
            List<Item> items = itemRepository.findByOwner_Id(userId);
            
            System.out.println("GET /api/items/user/" + userId + " - Found " + items.size() + " items");
            
            // Pre-process items to set ownerId before serialization
            for (Item item : items) {
                if (item.getOwner() != null) {
                    item.setOwnerId(item.getOwner().getId());
                }
                System.out.println("User item: " + item.getTitle() + ", OwnerId: " + item.getOwnerId());
            }
            
            System.out.println("About to return user items response...");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.err.println("Error in getItemsByUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item item) {
        try {
            Optional<Item> existingItemOpt = itemRepository.findById(id);
            if (existingItemOpt.isPresent()) {
                Item existingItem = existingItemOpt.get();
                
                // Update only the fields that can be changed
                existingItem.setTitle(item.getTitle());
                existingItem.setDescription(item.getDescription());
                existingItem.setCategory(item.getCategory());
                existingItem.setCondition(item.getCondition());
                existingItem.setAskingPrice(item.getAskingPrice());
                
                // Keep the original ownerId, createdAt, and other system fields
                Item updatedItem = itemRepository.save(existingItem);
                return ResponseEntity.ok(updatedItem);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        try {
            if (itemRepository.existsById(id)) {
                itemRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
