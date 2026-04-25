package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Resource;
import com.example.demo.model.Resource.ResourceStatus;
import com.example.demo.model.Resource.ResourceType;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public List<Resource> getAllResources() {
        List<Resource> resources = resourceRepository.findAll();
        resources.forEach(this::updateCurrentStatus);
        return resources;
    }

    public Resource getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        updateCurrentStatus(resource);
        return resource;
    }

    /**
     * Dynamically updates the resource status to OCCUPIED if there is an
     * approved booking active RIGHT NOW.
     */
    private void updateCurrentStatus(Resource resource) {

        // If it's already in maintenance or retired, don't override that
        if (resource.getStatus() == ResourceStatus.MAINTENANCE || resource.getStatus() == ResourceStatus.RETIRED) {
            return;
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now();

        List<com.example.demo.model.Booking> bookings = bookingRepository.findConflicting(
                resource.getId(),
                today,
                now,
                now.plusMinutes(1),
                List.of(com.example.demo.model.Booking.BookingStatus.APPROVED));

        if (!bookings.isEmpty()) {
            com.example.demo.model.Booking current = bookings.get(0);

            resource.setStatus(ResourceStatus.OCCUPIED);

            // 🔥 ADD THIS PART (this was missing before)
            resource.setOccupiedFrom(
                    today.atTime(current.getStartTime()));
            resource.setOccupiedUntil(
                    today.atTime(current.getEndTime()));

        } else {
            resource.setStatus(ResourceStatus.AVAILABLE);

            // clear old values
            resource.setOccupiedFrom(null);
            resource.setOccupiedUntil(null);
        }
    }

    public List<Resource> getAvailableResources() {
        return resourceRepository.findByStatus(ResourceStatus.AVAILABLE);
    }

    public List<Resource> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> searchResources(String name) {
        return resourceRepository.findByNameContainingIgnoreCase(name);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        Resource existing = getResourceById(id);
        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setLocation(updatedResource.getLocation());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setStatus(updatedResource.getStatus());
        existing.setOccupiedFrom(updatedResource.getOccupiedFrom());
        existing.setOccupiedUntil(updatedResource.getOccupiedUntil());
        existing.setDescription(updatedResource.getDescription());
        return resourceRepository.save(existing);
    }

    public Resource updateStatus(Long id, ResourceStatus status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        return resourceRepository.save(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = getResourceById(id);
        // Manually delete bookings first to ensure FK constraint is satisfied
        bookingRepository.deleteByResource(resource);
        resourceRepository.delete(resource);
    }
}
