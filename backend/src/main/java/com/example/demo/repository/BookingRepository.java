package com.example.demo.repository;

import com.example.demo.model.Booking;
import com.example.demo.model.Booking.BookingStatus;
import com.example.demo.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findByResourceIdOrderByCreatedAtDesc(Long resourceId);

    List<Booking> findByStatusAndResourceIdOrderByCreatedAtDesc(BookingStatus status, Long resourceId);

    // Overlap check: two ranges [s1,e1) and [s2,e2) overlap when s1 < e2 AND e1 > s2
    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status IN :statuses " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflicting(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("statuses") List<BookingStatus> statuses
    );

    void deleteByResource(Resource resource);
}
