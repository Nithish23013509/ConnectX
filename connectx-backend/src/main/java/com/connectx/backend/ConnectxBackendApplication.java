package com.connectx.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ConnectxBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConnectxBackendApplication.class, args);
	}

}
