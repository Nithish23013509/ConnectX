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
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleDrivePollingService {

    private final ConnectedAppRepository connectedAppRepository;
    private final GoogleOAuthService googleOAuthService;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    public void pollNewFiles() {
        System.out.println("Starting Google Drive polling check...");
        List<ConnectedApp> driveApps = connectedAppRepository.findAll().stream()
                .filter(app -> "GOOGLE_DRIVE".equals(app.getProvider()) && "CONNECTED".equals(app.getStatus()) && app.getRefreshToken() != null)
                .toList();

        System.out.println("Found " + driveApps.size() + " connected Google Drive apps with refresh tokens.");

        for (ConnectedApp app : driveApps) {
            try {
                System.out.println("Checking Drive files for: " + app.getAccountEmail());
                String accessToken = googleOAuthService.refreshAccessToken(app.getRefreshToken());
                
                // Fetch recent files that are not trashed
                JsonNode response = googleOAuthService.fetchRecentDriveFiles(accessToken, "trashed=false");
                
                if (response.has("files")) {
                    System.out.println("Found " + response.get("files").size() + " recent files.");
                    for (JsonNode fileNode : response.get("files")) {
                        String fileId = fileNode.get("id").asText();
                        
                        // Check if we already have this notification
                        if (notificationRepository.existsByExternalMessageIdAndProvider(fileId, "GOOGLE_DRIVE")) {
                            System.out.println("File " + fileId + " already processed.");
                            continue;
                        }

                        String fileName = fileNode.has("name") ? fileNode.get("name").asText() : "Unknown File";
                        String createdTimeStr = fileNode.has("createdTime") ? fileNode.get("createdTime").asText() : null;
                        
                        String ownerName = "Unknown Owner";
                        if (fileNode.has("owners") && fileNode.get("owners").isArray() && fileNode.get("owners").size() > 0) {
                            JsonNode ownerNode = fileNode.get("owners").get(0);
                            ownerName = ownerNode.has("displayName") ? ownerNode.get("displayName").asText() : ownerName;
                        }

                        LocalDateTime receivedAt = LocalDateTime.now();
                        if (createdTimeStr != null) {
                            receivedAt = LocalDateTime.parse(createdTimeStr, DateTimeFormatter.ISO_DATE_TIME);
                        }

                        LocalDateTime threshold = app.getLastSyncedAt() != null ? app.getLastSyncedAt() : app.getConnectedAt();
                        if (receivedAt.isBefore(threshold)) {
                            System.out.println("Skipping old file " + fileId + " created at " + receivedAt);
                            continue;
                        }

                        System.out.println("Saving notification for new file: " + fileName);

                        Notification notification = Notification.builder()
                                .provider("GOOGLE_DRIVE")
                                .externalMessageId(fileId)
                                .senderName(ownerName)
                                .senderIdentifier("Drive")
                                .message("New file added to Drive: " + fileName)
                                .messageType("file")
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
                    System.out.println("No recent files found.");
                }

                app.setLastSyncedAt(LocalDateTime.now());
                connectedAppRepository.save(app);

            } catch (Exception e) {
                System.err.println("Failed to poll Drive files for user " + app.getUser().getEmail() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
