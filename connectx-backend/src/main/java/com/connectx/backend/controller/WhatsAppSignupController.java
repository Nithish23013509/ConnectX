package com.connectx.backend.controller;

import com.connectx.backend.dto.WhatsAppSignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apps/whatsapp")
@RequiredArgsConstructor
public class WhatsAppSignupController {

    @PostMapping("/embedded-signup")
    public ResponseEntity<String> embeddedSignup(
            @RequestBody WhatsAppSignupRequest request
    ) {

        System.out.println(
                "Embedded Signup authorization code received"
        );

        return ResponseEntity.ok(
                "Authorization code received"
        );
    }
}
