package com.connectx.backend.integration.whatsapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class MetaGraphService {

    @Value("${meta.app-id}")
    private String appId;

    @Value("${meta.app-secret}")
    private String appSecret;

    @Value("${meta.graph-api-version}")
    private String graphApiVersion;

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    private final RestTemplate restTemplate =
            new RestTemplate();

    public String exchangeAuthorizationCode(String code) {

        String url =
                "https://graph.facebook.com/"
                        + graphApiVersion
                        + "/oauth/access_token"
                        + "?client_id=" + appId
                        + "&client_secret=" + appSecret
                        + "&code=" + code;

        ResponseEntity<String> response =
                restTemplate.getForEntity(
                        url,
                        String.class
                );

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException(
                    "Meta authorization exchange failed"
            );
        }

        try {

            JsonNode json =
                    objectMapper.readTree(
                            response.getBody()
                    );

            JsonNode accessToken =
                    json.get("access_token");

            if (accessToken == null) {
                throw new RuntimeException(
                        "Meta did not return an access token"
                );
            }

            return accessToken.asText();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid Meta response",
                    e
            );
        }
    }
}
