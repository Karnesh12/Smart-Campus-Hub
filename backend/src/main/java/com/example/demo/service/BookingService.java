package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.*;
import com.example.demo.model.Booking.BookingStatus;
import com.example.demo.model.Resource.ResourceStatus;
import com.example.demo.model.User.Role;
import com.example.demo.repository.*;
import com.example.demo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Booking createBooking(Long userId, BookingRequest request) {
        Resource resource = resourceRepository.findById(request.getResourceId())
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (resource.getStatus() == ResourceStatus.MAINTENANCE || resource.getStatus() == ResourceStatus.RETIRED) {
            throw new IllegalStateException("Resource is not available for booking");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (request.getExpectedAttendees() > resource.getCapacity()) {
            throw new IllegalArgumentException(
                "Expected attendees (" + request.getExpectedAttendees() +
                ") exceed resource capacity (" + resource.getCapacity() + ")");
        }

        List<Booking> conflicts = bookingRepository.findConflicting(
            request.getResourceId(),
            request.getBookingDate(),
            request.getStartTime(),
            request.getEndTime(),
            List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
        );

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("This time slot conflicts with an existing booking for this resource");
        }

        Booking booking = Booking.builder()
            .resource(resource)
            .user(user)
            .bookingDate(request.getBookingDate())
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .purpose(request.getPurpose())
            .expectedAttendees(request.getExpectedAttendees())
            .status(BookingStatus.PENDING)
            .build();

        Booking saved = bookingRepository.save(booking);

        notificationService.notifyAdmins(
            "New Booking Request",
            user.getName() + " has requested to book " + resource.getName() + " on " + request.getBookingDate(),
            Notification.NotificationType.BOOKING_STATUS
        );

        return saved;
    }

    public Booking approveBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
            booking.getUser(),
            "Booking Approved",
            "Your booking for " + booking.getResource().getName() + " has been approved.",
            Notification.NotificationType.BOOKING_STATUS
        );

        return saved;
    }

    public Booking rejectBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
            booking.getUser(),
            "Booking Rejected",
            "Your booking for " + booking.getResource().getName() + " was rejected. Reason: " + reason,
            Notification.NotificationType.BOOKING_STATUS
        );

        return saved;
    }

    public Booking cancelBooking(Long bookingId, Long userId, Role userRole) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        boolean isOwner = booking.getUser().getId().equals(userId);
        boolean isAdmin = userRole == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new IllegalArgumentException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already " + booking.getStatus().name().toLowerCase());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getAllBookings(BookingStatus status, Long resourceId) {
        if (status != null && resourceId != null) {
            return bookingRepository.findByStatusAndResourceIdOrderByCreatedAtDesc(status, resourceId);
        }
        if (status != null) {
            return bookingRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        if (resourceId != null) {
            return bookingRepository.findByResourceIdOrderByCreatedAtDesc(resourceId);
        }
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
    }
}
