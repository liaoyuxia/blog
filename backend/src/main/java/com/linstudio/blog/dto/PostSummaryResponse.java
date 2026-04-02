package com.linstudio.blog.dto;

import java.util.List;

public class PostSummaryResponse {
    private final String slug;
    private final String title;
    private final String excerpt;
    private final String category;
    private final List<String> tags;
    private final String publishedAt;
    private final String readingTime;
    private final String cover;
    private final boolean featured;

    public PostSummaryResponse(
        String slug,
        String title,
        String excerpt,
        String category,
        List<String> tags,
        String publishedAt,
        String readingTime,
        String cover,
        boolean featured
    ) {
        this.slug = slug;
        this.title = title;
        this.excerpt = excerpt;
        this.category = category;
        this.tags = tags;
        this.publishedAt = publishedAt;
        this.readingTime = readingTime;
        this.cover = cover;
        this.featured = featured;
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
}
