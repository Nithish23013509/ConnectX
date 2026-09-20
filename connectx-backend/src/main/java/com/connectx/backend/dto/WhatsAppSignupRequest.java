package com.connectx.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WhatsAppSignupRequest {

    @NotBlank
    private String code;
}
