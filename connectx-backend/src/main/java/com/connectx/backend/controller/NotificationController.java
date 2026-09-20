package com.connectx.backend.controller;

import com.connectx.backend.dto.UnifiedNotificationResponse;
import com.connectx.backend.entity.Notification;
import com.connectx.backend.entity.User;
import com.connectx.backend.repository.NotificationRepository;
import com.connectx.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<UnifiedNotificationResponse> getNotifications(
            Authentication authentication
    ) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(notification ->
                        new UnifiedNotificationResponse(
                                notification.getId(),
                                notification.getProvider(),
                                notification.getSenderName(),
                                notification.getSenderIdentifier(),
                                notification.getMessage(),
                                notification.getMessageType(),
                                notification.getReceivedAt(),
                                notification.isRead()
                        )
                )
                .toList();
    }
}
