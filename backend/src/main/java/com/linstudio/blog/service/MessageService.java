package com.linstudio.blog.service;

import com.linstudio.blog.dto.AdminMessageResponse;
import com.linstudio.blog.dto.MessageRequest;
import com.linstudio.blog.dto.MessageResponse;
import com.linstudio.blog.entity.Message;
import com.linstudio.blog.repository.MessageRepository;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MessageService {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> findAll() {
        return messageRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse create(MessageRequest request) {
        Message message = new Message();
        message.setName(request.getName().trim());
        message.setEmail(request.getEmail().trim());
        message.setContent(request.getContent().trim());
        return toResponse(messageRepository.save(message));
    }

    @Transactional(readOnly = true)
    public List<AdminMessageResponse> findAllForAdmin() {
        return messageRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(this::toAdminResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
        if (!messageRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "留言不存在");
        }

        messageRepository.deleteById(id);
    }

    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
            message.getId(),
            message.getName(),
            message.getEmail(),
            message.getContent(),
            message.getCreatedAt().format(FORMATTER)
        );
    }

    private AdminMessageResponse toAdminResponse(Message message) {
        return new AdminMessageResponse(
            message.getId(),
            message.getName(),
            message.getEmail(),
            message.getContent(),
            message.getCreatedAt().format(FORMATTER)
        );
    }
}
