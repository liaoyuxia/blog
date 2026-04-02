package com.linstudio.blog.dto;

import java.util.List;

public class PostDetailResponse extends PostSummaryResponse {
    private final String content;

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
        String content
    ) {
        super(slug, title, excerpt, category, tags, publishedAt, readingTime, cover, featured);
        this.content = content;
    }

    public String getContent() {
        return content;
    }
}
