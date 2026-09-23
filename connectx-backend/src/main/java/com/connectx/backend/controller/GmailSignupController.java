package com.connectx.backend.controller;

import com.connectx.backend.dto.GmailSignupRequest;
import com.connectx.backend.entity.ConnectedApp;
import com.connectx.backend.entity.User;
import com.connectx.backend.integration.gmail.GoogleOAuthService;
import com.connectx.backend.repository.ConnectedAppRepository;
import com.connectx.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/apps/gmail")
@RequiredArgsConstructor
public class GmailSignupController {

    private final GoogleOAuthService googleOAuthService;
    private final ConnectedAppRepository connectedAppRepository;
    private final UserRepository userRepository;

    @PostMapping("/connect")
    public ResponseEntity<?> connectGmail(
            @Valid @RequestBody GmailSignupRequest request,
            Authentication authentication
    ) {

        JsonNode tokenResponse =
                googleOAuthService.exchangeAuthorizationCode(
                        request.getCode(),
                        request.getRedirectUri()
                );

        String accessToken = tokenResponse.get("access_token").asText();

        JsonNode userProfile = googleOAuthService.getUserProfile(accessToken);
        
        String email = userProfile.has("email") ? userProfile.get("email").asText() : null;
        String name = userProfile.has("name") ? userProfile.get("name").asText() : null;
        String googleId = userProfile.has("sub") ? userProfile.get("sub").asText() : null;

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();

        ConnectedApp connectedApp = connectedAppRepository
                .findByUserAndProvider(user, "GMAIL")
                .orElse(new ConnectedApp());

        connectedApp.setUser(user);
        connectedApp.setProvider("GMAIL");
        connectedApp.setStatus("CONNECTED");
        connectedApp.setAccountEmail(email);
        connectedApp.setAccountName(name);
        connectedApp.setExternalAccountId(googleId);
        
        if (connectedApp.getId() == null) {
            connectedApp.setConnectedAt(LocalDateTime.now());
        }
        connectedApp.setUpdatedAt(LocalDateTime.now());

        connectedAppRepository.save(connectedApp);

        return ResponseEntity.ok("Gmail connected successfully");
    }
}
