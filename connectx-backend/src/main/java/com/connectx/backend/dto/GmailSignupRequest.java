package com.connectx.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GmailSignupRequest {

    @NotBlank
    private String code;

    private String redirectUri;
}
