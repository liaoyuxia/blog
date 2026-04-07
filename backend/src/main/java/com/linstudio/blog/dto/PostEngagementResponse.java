package com.linstudio.blog.dto;

public class PostEngagementResponse {
    private final long viewCount;
    private final long likeCount;
    private final long commentCount;

    public PostEngagementResponse(long viewCount, long likeCount, long commentCount) {
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
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
