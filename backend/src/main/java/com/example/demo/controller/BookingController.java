package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.model.Booking.BookingStatus;
import com.example.demo.model.User.Role;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    // POST /api/bookings — any authenticated user creates a booking
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    // GET /api/bookings/my — returns the caller's own bookings
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getId()));
    }

    // GET /api/bookings — admin/staff only; supports ?status= and ?resourceId=
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long resourceId) {
        if (!isAdminOrStaff(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(bookingService.getAllBookings(status, resourceId));
    }

    // GET /api/bookings/{id} — owner or admin/staff
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        if (!booking.getUser().getId().equals(principal.getId()) && !isAdminOrStaff(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(booking);
    }

    // PATCH /api/bookings/{id}/approve — admin only
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // PATCH /api/bookings/{id}/reject — admin only; body: { "reason": "..." }
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        if (!isAdmin(principal)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String reason = body.getOrDefault("reason", "No reason provided");
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    // PATCH /api/bookings/{id}/cancel — owner or admin
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, principal.getId(), getRole(principal)));
    }

    private boolean isAdmin(UserPrincipal principal) {
        return principal.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isAdminOrStaff(UserPrincipal principal) {
        return principal.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_STAFF"));
    }

    private Role getRole(UserPrincipal principal) {
        if (isAdmin(principal)) return Role.ADMIN;
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"))) return Role.STAFF;
        return Role.STUDENT;
    }
}
