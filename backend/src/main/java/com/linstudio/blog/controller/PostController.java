package com.linstudio.blog.controller;

import com.linstudio.blog.dto.PostDetailResponse;
import com.linstudio.blog.dto.PostCommentRequest;
import com.linstudio.blog.dto.PostCommentResponse;
import com.linstudio.blog.dto.PostEngagementResponse;
import com.linstudio.blog.dto.PostPageResponse;
import com.linstudio.blog.dto.PostSummaryResponse;
import com.linstudio.blog.dto.PagedResponse;
import com.linstudio.blog.service.PostService;
import java.util.List;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostSummaryResponse> list(
        @RequestParam(value = "q", required = false) String keyword,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "tag", required = false) String tag,
        @RequestParam(value = "featured", required = false) Boolean featured,
        @RequestParam(value = "sort", required = false) String sort,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return postService.findPosts(keyword, category, tag, featured, sort, status, limit);
    }

    @GetMapping("/page")
    public PostPageResponse page(
        @RequestParam(value = "q", required = false) String keyword,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "tag", required = false) String tag,
        @RequestParam(value = "sort", required = false) String sort,
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "page", defaultValue = "1") Integer page,
        @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        return postService.findPostPage(keyword, category, tag, sort, status, page, pageSize);
    }

    @GetMapping("/{slug}")
    public PostDetailResponse detail(@PathVariable("slug") String slug) {
        return postService.findPostDetail(slug);
    }

    @PostMapping("/{slug}/views")
    public PostEngagementResponse recordView(@PathVariable("slug") String slug) {
        return postService.recordView(slug);
    }

    @PostMapping("/{slug}/likes")
    public PostEngagementResponse like(@PathVariable("slug") String slug) {
        return postService.incrementLike(slug);
    }

    @DeleteMapping("/{slug}/likes")
    public PostEngagementResponse unlike(@PathVariable("slug") String slug) {
        return postService.decrementLike(slug);
    }

    @GetMapping("/{slug}/comments")
    public PagedResponse<PostCommentResponse> comments(
        @PathVariable("slug") String slug,
        @RequestParam(value = "page", defaultValue = "1") Integer page,
        @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        return postService.findCommentPage(slug, page, pageSize);
    }

    @PostMapping("/{slug}/comments")
    public PostCommentResponse createComment(
        @PathVariable("slug") String slug,
        @Valid @RequestBody PostCommentRequest request
    ) {
        return postService.createComment(slug, request);
    }
}
