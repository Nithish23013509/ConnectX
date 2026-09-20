package com.connectx.backend.integration.whatsapp;

import com.connectx.backend.entity.ConnectedApp;
import com.connectx.backend.entity.Notification;
import com.connectx.backend.entity.User;
import com.connectx.backend.repository.ConnectedAppRepository;
import com.connectx.backend.repository.NotificationRepository;
import com.connectx.backend.websocket.NotificationWebSocketService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class WhatsAppWebhookService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConnectedAppRepository connectedAppRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationWebSocketService notificationWebSocketService;

    public void processWebhook(String payload) {

        try {

            JsonNode root =
                    objectMapper.readTree(payload);

            JsonNode entries =
                    root.path("entry");

            if (!entries.isArray()) {
                return;
            }

            for (JsonNode entry : entries) {

                String businessAccountId =
                        entry.path("id").asText(null);

                JsonNode changes =
                        entry.path("changes");

                if (!changes.isArray()) {
                    continue;
                }

                for (JsonNode change : changes) {

                    if (!"messages".equals(
                            change.path("field").asText()
                    )) {
                        continue;
                    }

                    JsonNode value =
                            change.path("value");

                    String phoneNumberId =
                            value.path("metadata")
                                    .path("phone_number_id")
                                    .asText(null);

                    JsonNode messages =
                            value.path("messages");

                    if (!messages.isArray()) {
                        continue;
                    }

                    for (JsonNode message : messages) {

                        processMessage(
                                message,
                                businessAccountId,
                                phoneNumberId
                        );
                    }
                }
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to process WhatsApp webhook",
                    e
            );
        }
    }

    private void processMessage(
            JsonNode message,
            String businessAccountId,
            String phoneNumberId
    ) {

        String messageId =
                message.path("id").asText(null);

        if (messageId == null) {
            return;
        }

        if (notificationRepository
                .existsByExternalMessageId(messageId)) {

            return;
        }

        String senderIdentifier =
                message.path("from").asText(null);

        String messageType =
                message.path("type").asText("unknown");

        String messageText =
                extractMessageText(message);

        String senderName =
                extractSenderName(message);

        ConnectedApp connectedApp =
                findConnectedApp(
                        businessAccountId,
                        phoneNumberId
                );

        if (connectedApp == null) {

            System.out.println(
                    "No ConnectX user found for WhatsApp account: "
                            + businessAccountId
            );

            return;
        }

        User user = connectedApp.getUser();

        long timestamp =
                message.path("timestamp")
                        .asLong(
                                System.currentTimeMillis() / 1000
                        );

        LocalDateTime receivedAt =
                LocalDateTime.ofInstant(
                        Instant.ofEpochSecond(timestamp),
                        ZoneId.systemDefault()
                );

        Notification notification =
                Notification.builder()
                        .provider("WHATSAPP")
                        .externalMessageId(messageId)
                        .senderName(senderName)
                        .senderIdentifier(senderIdentifier)
                        .message(messageText)
                        .messageType(messageType)
                        .externalAccountId(
                                businessAccountId
                        )
                        .externalPhoneNumberId(
                                phoneNumberId
                        )
                        .receivedAt(receivedAt)
                        .user(user)
                        .build();

        Notification savedNotification =
                notificationRepository.save(notification);

        notificationWebSocketService
                .sendNotification(savedNotification);
    }

    private ConnectedApp findConnectedApp(
            String businessAccountId,
            String phoneNumberId
    ) {

        return connectedAppRepository
                .findAll()
                .stream()
                .filter(app ->
                        "WHATSAPP".equals(
                                app.getProvider()
                        )
                )
                .filter(app ->
                        businessAccountId != null
                                && businessAccountId.equals(
                                app.getExternalAccountId()
                        )
                                ||
                                phoneNumberId != null
                                && phoneNumberId.equals(
                                app.getExternalPhoneNumberId()
                        )
                )
                .findFirst()
                .orElse(null);
    }

    private String extractMessageText(
            JsonNode message
    ) {

        String type =
                message.path("type").asText();

        if ("text".equals(type)) {

            return message.path("text")
                    .path("body")
                    .asText("");
        }

        return "[" + type + " message]";
    }

    private String extractSenderName(
            JsonNode message
    ) {

        /*
         * The sender profile is normally provided
         * separately in the webhook value.contacts array.
         *
         * For now we use the sender identifier.
         */
        return message.path("from").asText("Unknown");
    }
}
