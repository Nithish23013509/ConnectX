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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class YouTubePollingService {

    private final ConnectedAppRepository connectedAppRepository;
    private final GoogleOAuthService googleOAuthService;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    public void pollNewActivities() {
        System.out.println("Starting YouTube polling check...");
        List<ConnectedApp> youtubeApps = connectedAppRepository.findAll().stream()
                .filter(app -> "YOUTUBE".equals(app.getProvider()) && "CONNECTED".equals(app.getStatus()) && app.getRefreshToken() != null)
                .toList();

        System.out.println("Found " + youtubeApps.size() + " connected YouTube apps with refresh tokens.");

        for (ConnectedApp app : youtubeApps) {
            try {
                System.out.println("Checking YouTube activities for: " + app.getAccountEmail());
                String accessToken = googleOAuthService.refreshAccessToken(app.getRefreshToken());
                
                // Fetch YouTube activities
                JsonNode response = googleOAuthService.fetchYouTubeActivities(accessToken);
                
                if (response.has("items")) {
                    System.out.println("Found " + response.get("items").size() + " recent activities.");
                    for (JsonNode activityNode : response.get("items")) {
                        String activityId = activityNode.get("id").asText();
                        
                        // Check if we already have this notification
                        if (notificationRepository.existsByExternalMessageIdAndProvider(activityId, "YOUTUBE")) {
                            System.out.println("Activity " + activityId + " already processed.");
                            continue;
                        }

                        JsonNode snippet = activityNode.has("snippet") ? activityNode.get("snippet") : null;
                        if (snippet == null) continue;

                        String title = snippet.has("title") ? snippet.get("title").asText() : "New Activity";
                        String channelTitle = snippet.has("channelTitle") ? snippet.get("channelTitle").asText() : "YouTube Channel";
                        String publishedAtStr = snippet.has("publishedAt") ? snippet.get("publishedAt").asText() : null;
                        
                        LocalDateTime receivedAt = LocalDateTime.now();
                        if (publishedAtStr != null) {
                            receivedAt = LocalDateTime.parse(publishedAtStr, DateTimeFormatter.ISO_DATE_TIME);
                        }

                        LocalDateTime threshold = app.getLastSyncedAt() != null ? app.getLastSyncedAt() : app.getConnectedAt();
                        if (receivedAt.isBefore(threshold)) {
                            System.out.println("Skipping old activity " + activityId + " published at " + receivedAt);
                            continue;
                        }

                        System.out.println("Saving notification for new YouTube activity: " + title);

                        Notification notification = Notification.builder()
                                .provider("YOUTUBE")
                                .externalMessageId(activityId)
                                .senderName(channelTitle)
                                .senderIdentifier("YouTube")
                                .message(title)
                                .messageType("video")
                                .receivedAt(receivedAt)
                                .user(app.getUser())
                                .build();

                        notificationRepository.save(notification);

                        NotificationResponse dto = NotificationResponse.builder()
                                .id(notification.getId())
                                .provider(notification.getProvider())
                                .senderName(notification.getSenderName())
                                .senderIdentifier(notification.getSenderIdentifier())
                                .message(notification.getMessage())
                                .messageType(notification.getMessageType())
                                .receivedAt(notification.getReceivedAt())
                                .createdAt(notification.getCreatedAt())
                                .build();

                        messagingTemplate.convertAndSend(
                                "/topic/notifications/" + app.getUser().getId(),
                                dto
                        );
                        System.out.println("Sent WebSocket notification to user " + app.getUser().getId());
                    }
                } else {
                    System.out.println("No recent YouTube activities found.");
                }

                app.setLastSyncedAt(LocalDateTime.now());
                connectedAppRepository.save(app);

            } catch (Exception e) {
                System.err.println("Failed to poll YouTube activities for user " + app.getUser().getEmail() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
