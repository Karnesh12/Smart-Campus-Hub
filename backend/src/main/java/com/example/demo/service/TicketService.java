package com.example.demo.service;

import com.example.demo.dto.TicketRequestDTO;
import com.example.demo.dto.TicketResponseDTO;
import com.example.demo.dto.TicketStatusUpdateDTO;
import com.example.demo.model.Ticket;
import com.example.demo.model.TicketAttachment;
import com.example.demo.repository.TicketAttachmentRepository;
import com.example.demo.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository attachmentRepository;

    @Value("${file.upload-dir:uploads/tickets}")
    private String uploadDir;

    // ── CREATE ────────────────────────────────────────────────────────────────
    public TicketResponseDTO createTicket(TicketRequestDTO dto, List<MultipartFile> files) throws IOException {

        if (files != null && files.size() > 3) {
            throw new IllegalArgumentException("Maximum 3 image attachments allowed");
        }

        Ticket ticket = Ticket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(Ticket.Priority.valueOf(dto.getPriority()))
                .status(Ticket.TicketStatus.OPEN)
                .resourceLocation(dto.getResourceLocation())
                .resourceId(dto.getResourceId())
                .reportedByUserId("testuser")
                .reportedByEmail("testuser@test.com")
                .preferredContact(dto.getPreferredContact())
                .build();

        Ticket saved = ticketRepository.save(ticket);

        if (files != null) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    saveAttachment(saved, file);
                }
            }
        }

        return toResponseDTO(ticketRepository.findById(saved.getId()).orElse(saved));
    }

    // ── ADD ATTACHMENTS TO EXISTING TICKET ───────────────────────────────────
    public TicketResponseDTO addAttachments(Long ticketId, List<MultipartFile> files) throws IOException {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));

        long existing = attachmentRepository.countByTicketId(ticketId);
        if (existing + files.size() > 3) {
            throw new IllegalArgumentException(
                "Maximum 3 attachments allowed. This ticket already has " + existing + " attachment(s).");
        }

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                saveAttachment(ticket, file);
            }
        }

        return toResponseDTO(ticketRepository.findById(ticketId).orElse(ticket));
    }

    // ── GET ATTACHMENT FILE ───────────────────────────────────────────────────
    public ResponseEntity<Resource> getAttachment(Long attachmentId) throws IOException {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Path filePath = Paths.get(attachment.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new RuntimeException("File not found on server");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);
    }

    // ── READ ALL ──────────────────────────────────────────────────────────────
    public List<TicketResponseDTO> getAllTickets(String status, String priority, String category) {
        List<Ticket> tickets;
        if (status != null) {
            tickets = ticketRepository.findByStatus(Ticket.TicketStatus.valueOf(status));
        } else if (priority != null) {
            tickets = ticketRepository.findByPriority(Ticket.Priority.valueOf(priority));
        } else if (category != null) {
            tickets = ticketRepository.findByCategory(category);
        } else {
            tickets = ticketRepository.findAll();
        }
        return tickets.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // ── READ MY TICKETS ───────────────────────────────────────────────────────
    public List<TicketResponseDTO> getMyTickets() {
        return ticketRepository.findByReportedByUserId("testuser")
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    // ── READ SINGLE ───────────────────────────────────────────────────────────
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
        return toResponseDTO(ticket);
    }

    // ── UPDATE STATUS ─────────────────────────────────────────────────────────
    public TicketResponseDTO updateTicketStatus(Long id, TicketStatusUpdateDTO dto) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));

        Ticket.TicketStatus newStatus = Ticket.TicketStatus.valueOf(dto.getStatus());
        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus);

        if (dto.getResolutionNotes() != null) ticket.setResolutionNotes(dto.getResolutionNotes());
        if (dto.getRejectionReason() != null) ticket.setRejectionReason(dto.getRejectionReason());
        if (dto.getAssignedTechnicianId() != null) ticket.setAssignedTechnicianId(dto.getAssignedTechnicianId());
        if (dto.getAssignedTechnicianName() != null) ticket.setAssignedTechnicianName(dto.getAssignedTechnicianName());
        if (newStatus == Ticket.TicketStatus.RESOLVED) ticket.setResolvedAt(LocalDateTime.now());

        return toResponseDTO(ticketRepository.save(ticket));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
        ticketRepository.delete(ticket);
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────────────────────
    private void saveAttachment(Ticket ticket, MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        TicketAttachment attachment = TicketAttachment.builder()
                .ticket(ticket)
                .fileName(file.getOriginalFilename())
                .filePath(filePath.toString())
                .fileType(contentType)
                .fileSize(file.getSize())
                .build();

        attachmentRepository.save(attachment);
    }

    private void validateStatusTransition(Ticket.TicketStatus current, Ticket.TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == Ticket.TicketStatus.IN_PROGRESS
                      || next == Ticket.TicketStatus.REJECTED;
            case IN_PROGRESS -> next == Ticket.TicketStatus.RESOLVED
                             || next == Ticket.TicketStatus.REJECTED;
            case RESOLVED -> next == Ticket.TicketStatus.CLOSED;
            default -> false;
        };
        if (!valid) throw new IllegalStateException(
                "Invalid status transition from " + current + " to " + next);
    }

    private TicketResponseDTO toResponseDTO(Ticket ticket) {
        List<String> urls = ticket.getAttachments().stream()
                .map(a -> "/api/tickets/attachments/" + a.getId())
                .collect(Collectors.toList());

        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .priority(ticket.getPriority().name())
                .status(ticket.getStatus().name())
                .resourceLocation(ticket.getResourceLocation())
                .resourceId(ticket.getResourceId())
                .reportedByUserId(ticket.getReportedByUserId())
                .reportedByEmail(ticket.getReportedByEmail())
                .preferredContact(ticket.getPreferredContact())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .assignedTechnicianName(ticket.getAssignedTechnicianName())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .attachmentUrls(urls)
                .commentCount(ticket.getComments().size())
                .build();
    }
}