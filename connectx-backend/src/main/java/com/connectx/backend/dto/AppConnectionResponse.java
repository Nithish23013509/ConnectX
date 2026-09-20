package com.connectx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AppConnectionResponse {

    private String provider;
    private String displayName;
    private String status;
    private String accountName;
    private String accountEmail;
}
