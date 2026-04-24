package com.example.demo.controller;

import com.example.demo.dto.TicketRequestDTO;
import com.example.demo.dto.TicketResponseDTO;
import com.example.demo.dto.TicketStatusUpdateDTO;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    // POST /api/tickets — Create a new ticket (any logged in user)
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody TicketRequestDTO dto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(dto, userPrincipal));
    }

    // POST /api/tickets/{id}/attachments — Upload images
    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketResponseDTO> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        return ResponseEntity.ok(ticketService.addAttachments(id, Arrays.asList(files)));
    }

    // GET /api/tickets/attachments/{attachmentId} — View image
    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<Resource> getAttachment(
            @PathVariable Long attachmentId) throws IOException {
        return ticketService.getAttachment(attachmentId);
    }

    // GET /api/tickets — Get all tickets (ADMIN and STAFF only)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority, category));
    }

    // GET /api/tickets/my — Get current logged in user's tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(ticketService.getMyTickets(userPrincipal));
    }

    // GET /api/tickets/{id} — Get single ticket
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PATCH /api/tickets/{id}/status — Update ticket status (ADMIN and STAFF only)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateDTO dto) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, dto));
    }

    // DELETE /api/tickets/{id} — Delete ticket (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}