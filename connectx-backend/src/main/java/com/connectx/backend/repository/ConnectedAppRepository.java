package com.connectx.backend.repository;

import com.connectx.backend.entity.ConnectedApp;
import com.connectx.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectedAppRepository
        extends JpaRepository<ConnectedApp, Long> {

    List<ConnectedApp> findByUser(User user);

    Optional<ConnectedApp> findByUserAndProvider(
            User user,
            String provider
    );

    boolean existsByUserAndProvider(
            User user,
            String provider
    );
}
