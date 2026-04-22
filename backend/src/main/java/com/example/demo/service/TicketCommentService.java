package com.example.demo.service;

import com.example.demo.dto.CommentRequestDTO;
import com.example.demo.dto.CommentResponseDTO;
import com.example.demo.model.Ticket;
import com.example.demo.model.TicketComment;
import com.example.demo.repository.TicketCommentRepository;
import com.example.demo.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .content(dto.getContent())
                .authorId("testuser")
                .authorName("Test User")
                .authorRole("USER")
                .build();

        return toDTO(commentRepository.save(comment));
    }

    public List<CommentResponseDTO> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CommentResponseDTO updateComment(Long commentId, CommentRequestDTO dto) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Ownership check skipped for now (no auth)
        comment.setContent(dto.getContent());
        return toDTO(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
    }

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