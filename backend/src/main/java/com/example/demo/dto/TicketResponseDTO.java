package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String resourceLocation;
    private String resourceId;
    private String reportedByUserId;
    private String reportedByEmail;
    private String reportedByName;
    private String preferredContact;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private List<String> attachmentUrls;
    private int commentCount;
}