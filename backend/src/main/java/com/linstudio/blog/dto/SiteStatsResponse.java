package com.linstudio.blog.dto;

public class SiteStatsResponse {
    private final long postCount;
    private final long categoryCount;
    private final long tagCount;
    private final long messageCount;

    public SiteStatsResponse(long postCount, long categoryCount, long tagCount, long messageCount) {
        this.postCount = postCount;
        this.categoryCount = categoryCount;
        this.tagCount = tagCount;
        this.messageCount = messageCount;
    }

    public long getPostCount() {
        return postCount;
    }

    public long getCategoryCount() {
        return categoryCount;
    }

    public long getTagCount() {
        return tagCount;
    }

    public long getMessageCount() {
        return messageCount;
    }
}
