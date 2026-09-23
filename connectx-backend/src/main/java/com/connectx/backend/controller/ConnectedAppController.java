package com.connectx.backend.controller;

import com.connectx.backend.dto.AppConnectionResponse;
import com.connectx.backend.entity.ConnectedApp;
import com.connectx.backend.entity.User;
import com.connectx.backend.repository.ConnectedAppRepository;
import com.connectx.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
public class ConnectedAppController {

    private final ConnectedAppRepository connectedAppRepository;
    private final UserRepository userRepository;

    private static final Map<String, String> AVAILABLE_APPS = Map.of(
            "WHATSAPP", "WhatsApp",
            "GMAIL", "Gmail",
            "GITHUB", "GitHub",
            "GOOGLE_DRIVE", "Google Drive",
            "GOOGLE_CALENDAR", "Google Calendar",
            "YOUTUBE", "YouTube"
    );

    @GetMapping
    public List<AppConnectionResponse> getApps(
            Authentication authentication
    ) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();

        List<ConnectedApp> connectedApps =
                connectedAppRepository.findByUser(user);

        List<AppConnectionResponse> response =
                new ArrayList<>();

        for (Map.Entry<String, String> app : AVAILABLE_APPS.entrySet()) {

            ConnectedApp connectedApp =
                    connectedApps.stream()
                            .filter(item ->
                                    item.getProvider()
                                            .equals(app.getKey()))
                            .findFirst()
                            .orElse(null);

            if (connectedApp == null) {

                response.add(
                        AppConnectionResponse.builder()
                                .provider(app.getKey())
                                .displayName(app.getValue())
                                .status("NOT_CONNECTED")
                                .build()
                );

            } else {

                response.add(
                        AppConnectionResponse.builder()
                                .provider(connectedApp.getProvider())
                                .displayName(app.getValue())
                                .status(connectedApp.getStatus())
                                .accountName(
                                        connectedApp.getAccountName()
                                )
                                .accountEmail(
                                        connectedApp.getAccountEmail()
                                )
                                .build()
                );
            }
        }

        return response;
    }

    @DeleteMapping("/{provider}")
    public org.springframework.http.ResponseEntity<?> disconnectApp(
            @PathVariable String provider,
            Authentication authentication
    ) {
        try {
            User user = userRepository
                    .findByEmail(authentication.getName())
                    .orElseThrow();

            List<ConnectedApp> apps = connectedAppRepository.findByUserAndProvider(user, provider);
            connectedAppRepository.deleteAll(apps);
                    
            return org.springframework.http.ResponseEntity.ok("Disconnected successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return org.springframework.http.ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
