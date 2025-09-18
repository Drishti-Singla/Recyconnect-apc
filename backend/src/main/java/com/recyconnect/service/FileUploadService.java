package com.recyconnect.service;

import com.recyconnect.entity.Item;
import com.recyconnect.entity.ItemImage;
import com.recyconnect.repository.ItemImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    @Autowired
    private ItemImageRepository itemImageRepository;

    private final String uploadDir = "uploads/items/";

    public List<ItemImage> saveItemImages(List<MultipartFile> files, Item item) throws IOException {
        List<ItemImage> savedImages = new ArrayList<>();
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            if (!file.isEmpty()) {
                // Generate unique filename
                String originalFileName = file.getOriginalFilename();
                String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                String fileName = UUID.randomUUID().toString() + fileExtension;
                
                // Save file to disk
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath);
                
                // Create ItemImage entity
                ItemImage itemImage = new ItemImage();
                itemImage.setFileName(originalFileName);
                itemImage.setFilePath(uploadDir + fileName);
                itemImage.setFileType(file.getContentType());
                itemImage.setFileSize(file.getSize());
                itemImage.setItem(item);
                itemImage.setPrimary(i == 0); // First image is primary
                
                // Set the additional fields that might be required
                itemImage.setImages(originalFileName); // Use filename for images field
                itemImage.setImageUrl(uploadDir + fileName); // Use file path for image_url
                
                System.out.println("Saving ItemImage: " + originalFileName + " for item ID: " + item.getId());
                savedImages.add(itemImageRepository.save(itemImage));
            }
        }
        
        return savedImages;
    }
}
