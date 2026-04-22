package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @NotBlank(message = "Resource location is required")
    private String resourceLocation;

    private String resourceId;

    private String preferredContact;
}