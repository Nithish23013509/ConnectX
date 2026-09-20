package com.connectx.backend.websocket;

import com.connectx.backend.entity.Notification;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(
            Notification notification
    ) {

        Long userId =
                notification.getUser().getId();

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userId,
                notification
        );
    }
}
