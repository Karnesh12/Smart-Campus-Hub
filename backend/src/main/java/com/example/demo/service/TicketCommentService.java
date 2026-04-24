package com.example.demo.service;

import com.example.demo.dto.CommentRequestDTO;
import com.example.demo.dto.CommentResponseDTO;
import com.example.demo.model.Ticket;
import com.example.demo.model.TicketComment;
import com.example.demo.model.User;
import com.example.demo.repository.TicketCommentRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    // ── ADD COMMENT ───────────────────────────────────────────────────────────
    public CommentResponseDTO addComment(Long ticketId,
                                         CommentRequestDTO dto,
                                         UserPrincipal userPrincipal) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Get real user from JWT
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .content(dto.getContent())
                .authorId(String.valueOf(user.getId()))
                .authorName(user.getName())
                .authorRole(user.getRole().name()) // ADMIN, STAFF, STUDENT
                .build();

        return toDTO(commentRepository.save(comment));
    }

    // ── GET COMMENTS ──────────────────────────────────────────────────────────
    public List<CommentResponseDTO> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── UPDATE COMMENT (owner only) ───────────────────────────────────────────
    public CommentResponseDTO updateComment(Long commentId,
                                            CommentRequestDTO dto,
                                            UserPrincipal userPrincipal) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Ownership check — only the author can edit
        if (!comment.getAuthorId().equals(String.valueOf(userPrincipal.getId()))) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(dto.getContent());
        return toDTO(commentRepository.save(comment));
    }

    // ── DELETE COMMENT (owner or ADMIN/STAFF) ─────────────────────────────────
    public void deleteComment(Long commentId, UserPrincipal userPrincipal) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Get user role from users table
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdminOrStaff = user.getRole() == User.Role.ADMIN
                              || user.getRole() == User.Role.STAFF;
        boolean isOwner = comment.getAuthorId()
                .equals(String.valueOf(userPrincipal.getId()));

        if (!isOwner && !isAdminOrStaff) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    // ── TO DTO ────────────────────────────────────────────────────────────────
    private CommentResponseDTO toDTO(TicketComment c) {
        return CommentResponseDTO.builder()
                .id(c.getId())
                .ticketId(c.getTicket().getId())
                .content(c.getContent())
                .authorId(c.getAuthorId())
                .authorName(c.getAuthorName())
                .authorRole(c.getAuthorRole())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}