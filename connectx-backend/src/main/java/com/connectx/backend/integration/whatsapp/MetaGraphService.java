package com.connectx.backend.integration.whatsapp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class MetaGraphService {

    @Value("${meta.app-id}")
    private String appId;

    @Value("${meta.app-secret}")
    private String appSecret;

    @Value("${meta.graph-api-version}")
    private String graphApiVersion;

    @Value("${meta.system-user-access-token}")
    private String systemUserAccessToken;

    @Value("${meta.redirect-uri}")
    private String redirectUri;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final RestTemplate restTemplate = new RestTemplate();

    public JsonNode debugToken(String oauthUserToken) {

        java.net.URI uri = UriComponentsBuilder
                .fromUriString(
                        "https://graph.facebook.com/"
                                + graphApiVersion
                                + "/debug_token"
                )
                .queryParam("input_token", oauthUserToken)
                .build()
                .toUri();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(systemUserAccessToken);

        org.springframework.http.HttpEntity<Void> entity =
                new org.springframework.http.HttpEntity<>(headers);

        org.springframework.http.ResponseEntity<String> response =
                restTemplate.exchange(
                        uri,
                        org.springframework.http.HttpMethod.GET,
                        entity,
                        String.class
                );

        try {

            return objectMapper.readTree(
                    response.getBody()
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to parse Meta debug token response",
                    e
            );
        }
    }

    public String exchangeAuthorizationCode(String code) {

        java.net.URI uri = UriComponentsBuilder
                .fromUriString(
                        "https://graph.facebook.com/"
                                + graphApiVersion
                                + "/oauth/access_token"
                )
                .queryParam("client_id", appId)
                .queryParam("client_secret", appSecret)
                .queryParam("code", code)
                .queryParam("redirect_uri", redirectUri)
                .build()
                .toUri();

        try {

            String response = restTemplate.getForObject(
                    uri,
                    String.class
            );

            JsonNode json =
                    objectMapper.readTree(response);

            JsonNode accessToken =
                    json.get("access_token");

            if (accessToken == null ||
                    accessToken.asText().isBlank()) {

                throw new RuntimeException(
                        "Meta did not return an access token"
                );
            }

            return accessToken.asText();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to exchange Meta authorization code",
                    e
            );
        }
    }
}
