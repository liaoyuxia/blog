package com.linstudio.blog.controller;

import com.linstudio.blog.dto.MessageRequest;
import com.linstudio.blog.dto.MessageResponse;
import com.linstudio.blog.service.MessageService;
import java.util.List;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public List<MessageResponse> list() {
        return messageService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse create(@Valid @RequestBody MessageRequest request) {
        return messageService.create(request);
    }
}
