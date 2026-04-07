package com.linstudio.blog.dto;

public class AdminPostCommentResponse {
    private final Long id;
    private final Long postId;
    private final String postSlug;
    private final String postTitle;
    private final String name;
    private final String email;
    private final String content;
    private final String createdAt;

    public AdminPostCommentResponse(
        Long id,
        Long postId,
        String postSlug,
        String postTitle,
        String name,
        String email,
        String content,
        String createdAt
    ) {
        this.id = id;
        this.postId = postId;
        this.postSlug = postSlug;
        this.postTitle = postTitle;
        this.name = name;
        this.email = email;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getPostSlug() {
        return postSlug;
    }

    public Long getPostId() {
        return postId;
    }

    public String getPostTitle() {
        return postTitle;
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
