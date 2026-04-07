package com.linstudio.blog.dto;

import java.util.List;

public class AdminPostResponse {
    private final Long id;
    private final String slug;
    private final String title;
    private final String excerpt;
    private final String content;
    private final String category;
    private final List<String> tags;
    private final String publishedAt;
    private final String readingTime;
    private final String cover;
    private final boolean featured;
    private final String status;
    private final long viewCount;
    private final long likeCount;
    private final long commentCount;

    public AdminPostResponse(
        Long id,
        String slug,
        String title,
        String excerpt,
        String content,
        String category,
        List<String> tags,
        String publishedAt,
        String readingTime,
        String cover,
        boolean featured,
        String status,
        long viewCount,
        long likeCount,
        long commentCount
    ) {
        this.id = id;
        this.slug = slug;
        this.title = title;
        this.excerpt = excerpt;
        this.content = content;
        this.category = category;
        this.tags = tags;
        this.publishedAt = publishedAt;
        this.readingTime = readingTime;
        this.cover = cover;
        this.featured = featured;
        this.status = status;
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public String getTitle() {
        return title;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public String getContent() {
        return content;
    }

    public String getCategory() {
        return category;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getPublishedAt() {
        return publishedAt;
    }

    public String getReadingTime() {
        return readingTime;
    }

    public String getCover() {
        return cover;
    }

    public boolean isFeatured() {
        return featured;
    }

    public String getStatus() {
        return status;
    }

    public long getViewCount() {
        return viewCount;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public long getCommentCount() {
        return commentCount;
    }
}
