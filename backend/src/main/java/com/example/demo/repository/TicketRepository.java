package com.example.demo.repository;

import com.example.demo.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByReportedByUserId(String userId);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
    List<Ticket> findByAssignedTechnicianId(String technicianId);
    List<Ticket> findByPriority(Ticket.Priority priority);
    List<Ticket> findByCategory(String category);
}