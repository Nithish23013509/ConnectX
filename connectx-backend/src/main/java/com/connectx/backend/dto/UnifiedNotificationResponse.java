package com.connectx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UnifiedNotificationResponse {

    private Long id;

    private String provider;

    private String title;

    private String sender;

    private String message;

    private String type;

    private LocalDateTime receivedAt;

    private boolean read;
}
