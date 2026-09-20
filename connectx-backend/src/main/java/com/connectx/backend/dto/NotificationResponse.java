package com.connectx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private String provider;
    private String senderName;
    private String senderIdentifier;
    private String message;
    private String messageType;
    private LocalDateTime receivedAt;
    private LocalDateTime createdAt;
}
