package com.connectx.backend.service;

import com.connectx.backend.dto.NotificationResponse;
import com.connectx.backend.entity.ConnectedApp;
import com.connectx.backend.entity.Notification;
import com.connectx.backend.integration.gmail.GoogleOAuthService;
import com.connectx.backend.repository.ConnectedAppRepository;
import com.connectx.backend.repository.NotificationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GmailPollingService {

    private final ConnectedAppRepository connectedAppRepository;
    private final NotificationRepository notificationRepository;
    private final GoogleOAuthService googleOAuthService;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    public void pollNewEmails() {
        List<ConnectedApp> gmailApps = connectedAppRepository.findAll().stream()
                .filter(app -> "GMAIL".equals(app.getProvider()) && "CONNECTED".equals(app.getStatus()) && app.getRefreshToken() != null)
                .toList();

        for (ConnectedApp app : gmailApps) {
            try {
                String accessToken = googleOAuthService.refreshAccessToken(app.getRefreshToken());
                
                // Fetch unread messages
                JsonNode response = googleOAuthService.fetchUnreadEmails(accessToken, "is:unread");
                
                if (response.has("messages")) {
                    for (JsonNode msgNode : response.get("messages")) {
                        String msgId = msgNode.get("id").asText();
                        
                        // Check if we already have this notification
                        if (notificationRepository.existsByExternalMessageIdAndProvider(msgId, "GMAIL")) {
                            continue;
                        }

                        // We have a new email, fetch details
                        JsonNode msgDetails = googleOAuthService.getMessageDetails(accessToken, msgId);
                        
                        String subject = "No Subject";
                        String from = "Unknown Sender";
                        String snippet = msgDetails.has("snippet") ? msgDetails.get("snippet").asText() : "";
                        
                        JsonNode headers = msgDetails.path("payload").path("headers");
                        for (JsonNode header : headers) {
                            String name = header.get("name").asText();
                            if ("Subject".equalsIgnoreCase(name)) {
                                subject = header.get("value").asText();
                            } else if ("From".equalsIgnoreCase(name)) {
                                from = header.get("value").asText();
                            }
                        }

                        String internalDateStr = msgDetails.has("internalDate") ? msgDetails.get("internalDate").asText() : String.valueOf(System.currentTimeMillis());
                        LocalDateTime receivedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(Long.parseLong(internalDateStr)), ZoneId.systemDefault());

                        // Don't process emails older than the app's connection time if it's the first sync
                        if (app.getLastSyncedAt() == null && receivedAt.isBefore(app.getConnectedAt())) {
                            continue;
                        }

                        Notification notification = Notification.builder()
                                .provider("GMAIL")
                                .externalMessageId(msgId)
                                .senderName(from)
                                .senderIdentifier(from)
                                .message(subject + "\n" + snippet)
                                .messageType("text")
                                .receivedAt(receivedAt)
                                .user(app.getUser())
                                .build();

                        notificationRepository.save(notification);

                        NotificationResponse dto = NotificationResponse.builder()
                                .id(notification.getId())
                                .provider(notification.getProvider())
                                .sender(notification.getSenderName())
                                .message(notification.getMessage())
                                .receivedAt(notification.getReceivedAt())
                                .read(notification.isRead())
                                .build();

                        messagingTemplate.convertAndSend(
                                "/topic/notifications/" + app.getUser().getId(),
                                dto
                        );
                    }
                }

                app.setLastSyncedAt(LocalDateTime.now());
                connectedAppRepository.save(app);

            } catch (Exception e) {
                System.err.println("Failed to poll emails for user " + app.getUser().getEmail() + ": " + e.getMessage());
            }
        }
    }
}
