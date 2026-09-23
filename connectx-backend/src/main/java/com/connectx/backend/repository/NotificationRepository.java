package com.connectx.backend.repository;

import com.connectx.backend.entity.Notification;
import com.connectx.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(
            User user
    );

    boolean existsByExternalMessageIdAndProvider(
            String externalMessageId,
            String provider
    );
}
