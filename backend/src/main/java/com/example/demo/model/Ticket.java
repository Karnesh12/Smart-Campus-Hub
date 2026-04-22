package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Column(nullable = false)
    private String resourceLocation;

    private String resourceId;

    @Column(nullable = false)
    private String reportedByUserId;

    private String reportedByEmail;

    private String preferredContact;

    private String assignedTechnicianId;

    private String assignedTechnicianName;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    private String rejectionReason;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TicketAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<TicketComment> comments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public Priority getPriority() { return priority; }
    public TicketStatus getStatus() { return status; }
    public String getResourceLocation() { return resourceLocation; }
    public String getResourceId() { return resourceId; }
    public String getReportedByUserId() { return reportedByUserId; }
    public String getReportedByEmail() { return reportedByEmail; }
    public String getPreferredContact() { return preferredContact; }
    public String getAssignedTechnicianId() { return assignedTechnicianId; }
    public String getAssignedTechnicianName() { return assignedTechnicianName; }
    public String getResolutionNotes() { return resolutionNotes; }
    public String getRejectionReason() { return rejectionReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public List<TicketAttachment> getAttachments() { return attachments; }
    public List<TicketComment> getComments() { return comments; }

    // ── Setters ──────────────────────────────────────────────────────────────
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(String category) { this.category = category; }
    public void setPriority(Priority priority) { this.priority = priority; }
    public void setStatus(TicketStatus status) { this.status = status; }
    public void setResourceLocation(String resourceLocation) { this.resourceLocation = resourceLocation; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public void setReportedByUserId(String reportedByUserId) { this.reportedByUserId = reportedByUserId; }
    public void setReportedByEmail(String reportedByEmail) { this.reportedByEmail = reportedByEmail; }
    public void setPreferredContact(String preferredContact) { this.preferredContact = preferredContact; }
    public void setAssignedTechnicianId(String assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }
    public void setAssignedTechnicianName(String assignedTechnicianName) { this.assignedTechnicianName = assignedTechnicianName; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public void setAttachments(List<TicketAttachment> attachments) { this.attachments = attachments; }
    public void setComments(List<TicketComment> comments) { this.comments = comments; }

    // ── Builder ───────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final Ticket ticket = new Ticket();
        public Builder title(String v) { ticket.title = v; return this; }
        public Builder description(String v) { ticket.description = v; return this; }
        public Builder category(String v) { ticket.category = v; return this; }
        public Builder priority(Priority v) { ticket.priority = v; return this; }
        public Builder status(TicketStatus v) { ticket.status = v; return this; }
        public Builder resourceLocation(String v) { ticket.resourceLocation = v; return this; }
        public Builder resourceId(String v) { ticket.resourceId = v; return this; }
        public Builder reportedByUserId(String v) { ticket.reportedByUserId = v; return this; }
        public Builder reportedByEmail(String v) { ticket.reportedByEmail = v; return this; }
        public Builder preferredContact(String v) { ticket.preferredContact = v; return this; }
        public Ticket build() { return ticket; }
    }
}