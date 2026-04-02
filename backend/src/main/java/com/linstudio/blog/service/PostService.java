package com.linstudio.blog.service;

import com.linstudio.blog.dto.PostDetailResponse;
import com.linstudio.blog.dto.PostSummaryResponse;
import com.linstudio.blog.entity.Post;
import com.linstudio.blog.repository.PostRepository;
import com.linstudio.blog.specification.PostSpecification;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public List<PostSummaryResponse> findPosts(String keyword, String category, String tag, Boolean featured, Integer limit) {
        List<PostSummaryResponse> posts = postRepository.findAll(
                PostSpecification.byFilters(keyword, category, tag, featured),
                Sort.by(Sort.Direction.DESC, "publishedAt")
            )
            .stream()
            .map(this::toSummary)
            .collect(Collectors.toList());

        if (limit != null && limit > 0 && posts.size() > limit) {
            return posts.subList(0, limit);
        }

        return posts;
    }

    @Transactional(readOnly = true)
    public PostDetailResponse findPostDetail(String slug) {
        Post post = postRepository.findBySlug(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "文章不存在"));
        return toDetail(post);
    }

    private PostSummaryResponse toSummary(Post post) {
        return new PostSummaryResponse(
            post.getSlug(),
            post.getTitle(),
            post.getExcerpt(),
            post.getCategory().getName(),
            post.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toList()),
            post.getPublishedAt().toString(),
            post.getReadingTime(),
            post.getCover(),
            post.isFeatured()
        );
    }

    private PostDetailResponse toDetail(Post post) {
        return new PostDetailResponse(
            post.getSlug(),
            post.getTitle(),
            post.getExcerpt(),
            post.getCategory().getName(),
            post.getTags().stream().map(tag -> tag.getName()).collect(Collectors.toList()),
            post.getPublishedAt().toString(),
            post.getReadingTime(),
            post.getCover(),
            post.isFeatured(),
            post.getContent()
        );
    }
}
