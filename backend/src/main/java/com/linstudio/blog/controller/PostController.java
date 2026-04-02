package com.linstudio.blog.controller;

import com.linstudio.blog.dto.PostDetailResponse;
import com.linstudio.blog.dto.PostSummaryResponse;
import com.linstudio.blog.service.PostService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
        @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return postService.findPosts(keyword, category, tag, featured, limit);
    }

    @GetMapping("/{slug}")
    public PostDetailResponse detail(@PathVariable("slug") String slug) {
        return postService.findPostDetail(slug);
    }
}
