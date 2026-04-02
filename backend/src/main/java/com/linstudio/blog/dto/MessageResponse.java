package com.linstudio.blog.dto;

public class MessageResponse {
    private final Long id;
    private final String name;
    private final String email;
    private final String content;
    private final String createdAt;

    public MessageResponse(Long id, String name, String email, String content, String createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getContent() {
        return content;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
