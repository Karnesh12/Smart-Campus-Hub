package com.example.demo.controller;

import com.example.demo.dto.CommentRequestDTO;
import com.example.demo.dto.CommentResponseDTO;
import com.example.demo.service.TicketCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TicketCommentController {

    private final TicketCommentService commentService;

    // POST /api/tickets/{ticketId}/comments
    @PostMapping
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(ticketId, dto));
    }

    // GET /api/tickets/{ticketId}/comments
    @GetMapping
    public ResponseEntity<List<CommentResponseDTO>> getComments(
            @PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }

    // PUT /api/tickets/{ticketId}/comments/{commentId}
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequestDTO dto) {
        return ResponseEntity.ok(commentService.updateComment(commentId, dto));
    }

    // DELETE /api/tickets/{ticketId}/comments/{commentId}
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}