package com.connectx.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WhatsAppConnectRequest {

    @NotBlank
    private String businessAccountId;

    @NotBlank
    private String phoneNumberId;

    private String accountName;
}
