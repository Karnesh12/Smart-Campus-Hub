package com.example.demo.service;

import com.example.demo.model.Notification;
import com.example.demo.model.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public void notifyRoles(List<User.Role> roles, String title, String content, Notification.NotificationType type) {
        for (User.Role role : roles) {
            List<User> users = userRepository.findByRole(role);
            for (User user : users) {
                createNotification(user, title, content, type);
            }
        }
    }

    public void notifyAdmins(String title, String content, Notification.NotificationType type) {
        notifyRoles(List.of(User.Role.ADMIN), title, content, type);
    }

    public void notifyAdminsAndStaff(String title, String content, Notification.NotificationType type) {
        notifyRoles(List.of(User.Role.ADMIN, User.Role.STAFF), title, content, type);
    }

    public Notification createNotification(User recipient, String title, String content, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .content(content)
                .type(type)
                .read(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        
        // Push to WebSocket
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/topic/notifications",
                savedNotification
        );

        return savedNotification;
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndReadFalse(user);
    }
}
