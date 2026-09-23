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
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleCalendarPollingService {

    private final ConnectedAppRepository connectedAppRepository;
    private final GoogleOAuthService googleOAuthService;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    public void pollNewEvents() {
        System.out.println("Starting Google Calendar polling check...");
        List<ConnectedApp> calendarApps = connectedAppRepository.findAll().stream()
                .filter(app -> "GOOGLE_CALENDAR".equals(app.getProvider()) && "CONNECTED".equals(app.getStatus()) && app.getRefreshToken() != null)
                .toList();

        System.out.println("Found " + calendarApps.size() + " connected Google Calendar apps with refresh tokens.");

        for (ConnectedApp app : calendarApps) {
            try {
                System.out.println("Checking Calendar events for: " + app.getAccountEmail());
                String accessToken = googleOAuthService.refreshAccessToken(app.getRefreshToken());
                
                // timeMin must be an RFC3339 timestamp with mandatory time zone offset
                String timeMin = Instant.now().toString();
                
                // Fetch upcoming events
                JsonNode response = googleOAuthService.fetchUpcomingEvents(accessToken, timeMin);
                
                if (response.has("items")) {
                    System.out.println("Found " + response.get("items").size() + " upcoming events.");
                    for (JsonNode eventNode : response.get("items")) {
                        String eventId = eventNode.get("id").asText();
                        
                        // Check if we already have this notification
                        if (notificationRepository.existsByExternalMessageIdAndProvider(eventId, "GOOGLE_CALENDAR")) {
                            System.out.println("Event " + eventId + " already processed.");
                            continue;
                        }

                        String summary = eventNode.has("summary") ? eventNode.get("summary").asText() : "Upcoming Event";
                        String createdTimeStr = eventNode.has("created") ? eventNode.get("created").asText() : null;
                        
                        LocalDateTime receivedAt = LocalDateTime.now();
                        if (createdTimeStr != null) {
                            receivedAt = LocalDateTime.parse(createdTimeStr, DateTimeFormatter.ISO_DATE_TIME);
                        }

                        LocalDateTime threshold = app.getLastSyncedAt() != null ? app.getLastSyncedAt() : app.getConnectedAt();
                        if (receivedAt.isBefore(threshold)) {
                            System.out.println("Skipping old event notification " + eventId + " created at " + receivedAt);
                            continue;
                        }

                        System.out.println("Saving notification for new event: " + summary);

                        Notification notification = Notification.builder()
                                .provider("GOOGLE_CALENDAR")
                                .externalMessageId(eventId)
                                .senderName("Google Calendar")
                                .senderIdentifier("Calendar")
                                .message("New Event Added: " + summary)
                                .messageType("event")
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
                    System.out.println("No upcoming events found.");
                }

                app.setLastSyncedAt(LocalDateTime.now());
                connectedAppRepository.save(app);

            } catch (Exception e) {
                System.err.println("Failed to poll Calendar events for user " + app.getUser().getEmail() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
