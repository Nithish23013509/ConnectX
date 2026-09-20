package com.connectx.backend.controller;

import com.connectx.backend.dto.WhatsAppSignupRequest;
import com.connectx.backend.integration.whatsapp.MetaGraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apps/whatsapp")
@RequiredArgsConstructor
public class WhatsAppSignupController {

    private final MetaGraphService metaGraphService;

    @PostMapping("/embedded-signup")
    public ResponseEntity<String> embeddedSignup(
            Authentication authentication,
            @RequestBody WhatsAppSignupRequest request
    ) {

        String oauthUserToken =
                metaGraphService.exchangeAuthorizationCode(
                        request.getCode()
                );

        com.fasterxml.jackson.databind.JsonNode debugResponse =
                metaGraphService.debugToken(
                        oauthUserToken
                );

        System.out.println(
                "Meta token validated successfully."
        );

        com.fasterxml.jackson.databind.JsonNode data =
                debugResponse.path("data");

        com.fasterxml.jackson.databind.JsonNode granularScopes =
                data.path("granular_scopes");

        if (!granularScopes.isArray()) {

            throw new RuntimeException(
                    "Meta did not return granular scopes"
            );
        }

        for (com.fasterxml.jackson.databind.JsonNode scope : granularScopes) {

            if ("whatsapp_business_management"
                    .equals(scope.path("scope").asText())) {

                com.fasterxml.jackson.databind.JsonNode targetIds =
                        scope.path("target_ids");

                for (com.fasterxml.jackson.databind.JsonNode targetId : targetIds) {

                    System.out.println(
                            "WABA ID discovered: "
                                    + targetId.asText()
                    );
                }
            }
        }

        return ResponseEntity.ok(
                "WhatsApp Business account discovered"
        );
    }
}
