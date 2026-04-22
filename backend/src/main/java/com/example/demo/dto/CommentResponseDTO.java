package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponseDTO {
    private Long id;
    private Long ticketId;
    private String content;
    private String authorId;
    private String authorName;
    private String authorRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}