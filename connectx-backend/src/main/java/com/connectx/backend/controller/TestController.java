package com.connectx.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is running!");
    }

    @org.springframework.beans.factory.annotation.Autowired
    private com.connectx.backend.repository.ConnectedAppRepository connectedAppRepository;

    @GetMapping("/test/apps")
    public Object testApps() {
        return connectedAppRepository.findAll();
    }
}
