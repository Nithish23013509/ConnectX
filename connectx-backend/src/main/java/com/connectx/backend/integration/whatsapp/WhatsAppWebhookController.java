package com.connectx.backend.integration.whatsapp;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/whatsapp")
@RequiredArgsConstructor
public class WhatsAppWebhookController {

    @Value("${whatsapp.verify-token}")
    private String verifyToken;

    private final WhatsAppWebhookService whatsappWebhookService;
    private final WhatsAppSignatureService whatsappSignatureService;

    @GetMapping
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge
    ) {

        if ("subscribe".equals(mode)
                && verifyToken.equals(token)) {

            return ResponseEntity.ok(challenge);
        }

        return ResponseEntity
                .status(403)
                .body("Webhook verification failed");
    }

    @PostMapping
    public ResponseEntity<String> receiveWebhook(
            @RequestHeader(
                    value = "X-Hub-Signature-256",
                    required = false
            ) String signature,
            @RequestBody String payload
    ) {

        boolean valid = whatsappSignatureService
                .isValid(payload, signature);

        if (!valid) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid webhook signature");
        }

        whatsappWebhookService.processWebhook(payload);

        return ResponseEntity.ok("EVENT_RECEIVED");
    }
}
