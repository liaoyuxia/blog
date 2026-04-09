package com.linstudio.blog.repository;

import com.linstudio.blog.entity.Message;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByOrderByCreatedAtDesc();

    Page<Message> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
