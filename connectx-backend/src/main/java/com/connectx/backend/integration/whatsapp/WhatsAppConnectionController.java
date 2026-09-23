package com.connectx.backend.integration.whatsapp;

import com.connectx.backend.dto.WhatsAppConnectRequest;
import com.connectx.backend.entity.ConnectedApp;
import com.connectx.backend.entity.User;
import com.connectx.backend.repository.ConnectedAppRepository;
import com.connectx.backend.repository.UserRepository;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/apps/whatsapp")
@RequiredArgsConstructor
public class WhatsAppConnectionController {

    private final UserRepository userRepository;
    private final ConnectedAppRepository connectedAppRepository;

    @PostMapping("/connect")
    public ConnectedApp connectWhatsApp(
            Authentication authentication,
            @Valid @RequestBody WhatsAppConnectRequest request
    ) {

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();

        ConnectedApp app =
                connectedAppRepository
                        .findByUserAndProvider(
                                user,
                                "WHATSAPP"
                        )
                        .stream()
                        .findFirst()
                        .orElse(
                                ConnectedApp.builder()
                                        .user(user)
                                        .provider("WHATSAPP")
                                        .build()
                        );

        app.setStatus("CONNECTED");

        app.setAccountName(
                request.getAccountName()
        );

        app.setExternalAccountId(
                request.getBusinessAccountId()
        );

        app.setExternalPhoneNumberId(
                request.getPhoneNumberId()
        );

        if (app.getConnectedAt() == null) {
            app.setConnectedAt(
                    LocalDateTime.now()
            );
        }

        app.setUpdatedAt(
                LocalDateTime.now()
        );

        return connectedAppRepository.save(app);
    }
}
