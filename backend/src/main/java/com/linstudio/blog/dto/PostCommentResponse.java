package com.linstudio.blog.dto;

public class PostCommentResponse {
    private final Long id;
    private final String name;
    private final String content;
    private final String createdAt;

    public PostCommentResponse(Long id, String name, String content, String createdAt) {
        this.id = id;
        this.name = name;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getContent() {
        return content;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
