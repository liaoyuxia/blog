package com.linstudio.blog.dto;

import java.util.List;

public class PostDetailResponse extends PostSummaryResponse {
    private final String content;
    private final List<PostCommentResponse> comments;
    private final List<PostSummaryResponse> relatedPosts;
    private final PostSummaryResponse prevPost;
    private final PostSummaryResponse nextPost;

    public PostDetailResponse(
        String slug,
        String title,
        String excerpt,
        String category,
        List<String> tags,
        String publishedAt,
        String readingTime,
        String cover,
        String recommendedForZh,
        String recommendedForEn,
        boolean starterRecommended,
        boolean homepageSelected,
        int sortWeight,
        boolean featured,
        String status,
        long viewCount,
        long likeCount,
        long commentCount,
        String content,
        List<PostCommentResponse> comments,
        List<PostSummaryResponse> relatedPosts,
        PostSummaryResponse prevPost,
        PostSummaryResponse nextPost
    ) {
        super(
            slug,
            title,
            excerpt,
            category,
            tags,
            publishedAt,
            readingTime,
            cover,
            recommendedForZh,
            recommendedForEn,
            starterRecommended,
            homepageSelected,
            sortWeight,
            featured,
            status,
            viewCount,
            likeCount,
            commentCount
        );
        this.content = content;
        this.comments = comments;
        this.relatedPosts = relatedPosts;
        this.prevPost = prevPost;
        this.nextPost = nextPost;
    }

    public String getContent() {
        return content;
    }

    public List<PostCommentResponse> getComments() {
        return comments;
    }

    public List<PostSummaryResponse> getRelatedPosts() {
        return relatedPosts;
    }

    public PostSummaryResponse getPrevPost() {
        return prevPost;
    }

    public PostSummaryResponse getNextPost() {
        return nextPost;
    }
}
