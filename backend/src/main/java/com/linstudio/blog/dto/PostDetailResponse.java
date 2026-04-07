package com.linstudio.blog.dto;

import java.util.List;

public class PostDetailResponse extends PostSummaryResponse {
    private final String content;
    private final List<PostCommentResponse> comments;

    public PostDetailResponse(
        String slug,
        String title,
        String excerpt,
        String category,
        List<String> tags,
        String publishedAt,
        String readingTime,
        String cover,
        boolean featured,
        String status,
        long viewCount,
        long likeCount,
        long commentCount,
        String content,
        List<PostCommentResponse> comments
    ) {
        super(slug, title, excerpt, category, tags, publishedAt, readingTime, cover, featured, status, viewCount, likeCount, commentCount);
        this.content = content;
        this.comments = comments;
    }

    public String getContent() {
        return content;
    }

    public List<PostCommentResponse> getComments() {
        return comments;
    }
}
