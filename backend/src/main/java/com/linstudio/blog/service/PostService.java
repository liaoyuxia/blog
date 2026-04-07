package com.linstudio.blog.service;

import com.linstudio.blog.dto.AdminPostRequest;
import com.linstudio.blog.dto.AdminPostCommentResponse;
import com.linstudio.blog.dto.AdminPostResponse;
import com.linstudio.blog.dto.PostDetailResponse;
import com.linstudio.blog.dto.PostCommentRequest;
import com.linstudio.blog.dto.PostCommentResponse;
import com.linstudio.blog.dto.PostEngagementResponse;
import com.linstudio.blog.dto.PostPageResponse;
import com.linstudio.blog.dto.PostSummaryResponse;
import com.linstudio.blog.entity.Category;
import com.linstudio.blog.entity.Post;
import com.linstudio.blog.entity.PostComment;
import com.linstudio.blog.entity.Tag;
import com.linstudio.blog.repository.CategoryRepository;
import com.linstudio.blog.repository.PostCommentRepository;
import com.linstudio.blog.repository.PostRepository;
import com.linstudio.blog.repository.TagRepository;
import com.linstudio.blog.specification.PostSpecification;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostService {
    private static final DateTimeFormatter COMMENT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public PostService(
        PostRepository postRepository,
        PostCommentRepository postCommentRepository,
        CategoryRepository categoryRepository,
        TagRepository tagRepository
    ) {
        this.postRepository = postRepository;
        this.postCommentRepository = postCommentRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public List<PostSummaryResponse> findPosts(
        String keyword,
        String category,
        String tag,
        Boolean featured,
        String status,
        Integer limit
    ) {
        List<PostSummaryResponse> posts = postRepository.findAll(
                PostSpecification.byFilters(keyword, category, tag, featured),
                Sort.by(Sort.Direction.DESC, "publishedAt")
            )
            .stream()
            .filter(post -> shouldIncludeStatus(post, status))
            .map(this::toSummary)
            .collect(Collectors.toList());

        if (limit != null && limit > 0 && posts.size() > limit) {
            return posts.subList(0, limit);
        }

        return posts;
    }

    @Transactional(readOnly = true)
    public PostPageResponse findPostPage(String keyword, String category, String tag, String status, Integer page, Integer pageSize) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 6 : Math.min(pageSize, 24);

        List<PostSummaryResponse> filtered = postRepository.findAll(
                PostSpecification.byFilters(keyword, category, tag, null),
                Sort.by(Sort.Direction.DESC, "publishedAt")
            )
            .stream()
            .filter(post -> shouldIncludeStatus(post, status))
            .map(this::toSummary)
            .collect(Collectors.toList());

        int totalPages = filtered.isEmpty() ? 1 : (int) Math.ceil((double) filtered.size() / safePageSize);
        int resolvedPage = Math.min(safePage, totalPages);
        int start = Math.min((resolvedPage - 1) * safePageSize, filtered.size());
        int end = Math.min(start + safePageSize, filtered.size());

        return new PostPageResponse(
            filtered.subList(start, end),
            resolvedPage,
            safePageSize,
            filtered.size(),
            totalPages
        );
    }

    @Transactional(readOnly = true)
    public PostDetailResponse findPostDetail(String slug) {
        Post post = findPublicPostBySlug(slug);
        return toDetail(post);
    }

    @Transactional(readOnly = true)
    public List<PostCommentResponse> findComments(String slug) {
        return findPublicPostBySlug(slug).getComments()
            .stream()
            .map(this::toCommentResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminPostResponse> findAllForAdmin() {
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt"))
            .stream()
            .map(this::toAdminResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdminPostCommentResponse> findAllCommentsForAdmin() {
        return postCommentRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(this::toAdminCommentResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public AdminPostResponse create(AdminPostRequest request) {
        String slug = normalizeSlug(request.getSlug());
        if (postRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "文章别名已存在");
        }

        Post post = new Post();
        applyAdminRequest(post, request, slug);
        return toAdminResponse(postRepository.save(post));
    }

    @Transactional
    public AdminPostResponse update(Long id, AdminPostRequest request) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "文章不存在"));

        String slug = normalizeSlug(request.getSlug());
        if (!Objects.equals(post.getSlug(), slug) && postRepository.existsBySlug(slug)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "文章别名已存在");
        }

        applyAdminRequest(post, request, slug);
        return toAdminResponse(postRepository.save(post));
    }

    @Transactional
    public void delete(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "文章不存在"));
        postRepository.delete(post);
    }

    @Transactional
    public PostEngagementResponse recordView(String slug) {
        Post post = findPublicPostBySlug(slug);
        post.setViewCount(post.getViewCount() + 1);
        return toEngagement(postRepository.save(post));
    }

    @Transactional
    public PostEngagementResponse incrementLike(String slug) {
        Post post = findPublicPostBySlug(slug);
        post.setLikeCount(post.getLikeCount() + 1);
        return toEngagement(postRepository.save(post));
    }

    @Transactional
    public PostEngagementResponse decrementLike(String slug) {
        Post post = findPublicPostBySlug(slug);
        post.setLikeCount(Math.max(0L, post.getLikeCount() - 1));
        return toEngagement(postRepository.save(post));
    }

    @Transactional
    public PostCommentResponse createComment(String slug, PostCommentRequest request) {
        Post post = findPublicPostBySlug(slug);
        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setName(request.getName().trim());
        comment.setEmail(request.getEmail().trim());
        comment.setContent(request.getContent().trim());
        return toCommentResponse(postCommentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long id) {
        if (!postCommentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "评论不存在");
        }

        postCommentRepository.deleteById(id);
    }

    private PostSummaryResponse toSummary(Post post) {
        return new PostSummaryResponse(
            post.getSlug(),
            post.getTitle(),
            post.getExcerpt(),
            post.getCategory().getName(),
            post.getTags().stream().map(Tag::getName).collect(Collectors.toList()),
            post.getPublishedAt().toString(),
            post.getReadingTime(),
            post.getCover(),
            post.isFeatured(),
            post.getStatus(),
            post.getViewCount(),
            post.getLikeCount(),
            post.getComments().size()
        );
    }

    private PostDetailResponse toDetail(Post post) {
        return new PostDetailResponse(
            post.getSlug(),
            post.getTitle(),
            post.getExcerpt(),
            post.getCategory().getName(),
            post.getTags().stream().map(Tag::getName).collect(Collectors.toList()),
            post.getPublishedAt().toString(),
            post.getReadingTime(),
            post.getCover(),
            post.isFeatured(),
            post.getStatus(),
            post.getViewCount(),
            post.getLikeCount(),
            post.getComments().size(),
            post.getContent(),
            post.getComments().stream().map(this::toCommentResponse).collect(Collectors.toList())
        );
    }

    private AdminPostResponse toAdminResponse(Post post) {
        return new AdminPostResponse(
            post.getId(),
            post.getSlug(),
            post.getTitle(),
            post.getExcerpt(),
            post.getContent(),
            post.getCategory().getName(),
            post.getTags().stream().map(Tag::getName).collect(Collectors.toList()),
            post.getPublishedAt().toString(),
            post.getReadingTime(),
            post.getCover(),
            post.isFeatured(),
            post.getStatus(),
            post.getViewCount(),
            post.getLikeCount(),
            post.getComments().size()
        );
    }

    private PostCommentResponse toCommentResponse(PostComment comment) {
        return new PostCommentResponse(
            comment.getId(),
            comment.getName(),
            comment.getContent(),
            comment.getCreatedAt().format(COMMENT_FORMATTER)
        );
    }

    private AdminPostCommentResponse toAdminCommentResponse(PostComment comment) {
        return new AdminPostCommentResponse(
            comment.getId(),
            comment.getPost().getId(),
            comment.getPost().getSlug(),
            comment.getPost().getTitle(),
            comment.getName(),
            comment.getEmail(),
            comment.getContent(),
            comment.getCreatedAt().format(COMMENT_FORMATTER)
        );
    }

    private PostEngagementResponse toEngagement(Post post) {
        return new PostEngagementResponse(
            post.getViewCount(),
            post.getLikeCount(),
            post.getComments().size()
        );
    }

    private void applyAdminRequest(Post post, AdminPostRequest request, String slug) {
        post.setSlug(slug);
        post.setTitle(request.getTitle().trim());
        post.setExcerpt(request.getExcerpt().trim());
        post.setContent(request.getContent().trim());
        post.setCover(request.getCover() == null ? null : request.getCover().trim());
        post.setReadingTime(request.getReadingTime().trim());
        post.setPublishedAt(parseDate(request.getPublishedAt()));
        post.setFeatured(request.isFeatured());
        post.setStatus(normalizeStatus(request.getStatus()));
        post.setCategory(resolveCategory(request.getCategory()));
        post.setTags(resolveTags(request.getTags()));
    }

    private Category resolveCategory(String rawName) {
        String name = rawName.trim();
        return categoryRepository.findByName(name)
            .orElseGet(() -> {
                Category category = new Category();
                category.setName(name);
                category.setDescription(name + " 分类下的文章");
                return categoryRepository.save(category);
            });
    }

    private List<Tag> resolveTags(List<String> rawTags) {
        List<Tag> tags = new ArrayList<Tag>();
        for (String rawTag : rawTags) {
            String name = rawTag.trim();
            if (name.isEmpty()) {
                continue;
            }

            Tag tag = tagRepository.findByName(name)
                .orElseGet(() -> {
                    Tag created = new Tag();
                    created.setName(name);
                    return tagRepository.save(created);
                });
            tags.add(tag);
        }

        if (tags.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请至少填写一个标签");
        }

        return tags;
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "发布日期格式必须为 YYYY-MM-DD");
        }
    }

    private String normalizeSlug(String slug) {
        String normalized = slug.trim().toLowerCase(Locale.ROOT);
        if (!normalized.matches("[a-z0-9-]+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "文章别名仅支持小写字母、数字和中划线");
        }
        return normalized;
    }

    private String normalizeStatus(String rawStatus) {
        String normalized = rawStatus == null ? "" : rawStatus.trim().toUpperCase(Locale.ROOT);
        if (!"DRAFT".equals(normalized) && !"PUBLISHED".equals(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "文章状态仅支持 DRAFT 或 PUBLISHED");
        }
        return normalized;
    }

    private boolean shouldIncludeStatus(Post post, String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (normalizedStatus.isEmpty()) {
            return "PUBLISHED".equals(post.getStatus());
        }
        return normalizedStatus.equals(post.getStatus());
    }

    private Post findPostBySlug(String slug) {
        return postRepository.findBySlug(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "文章不存在"));
    }

    private Post findPublicPostBySlug(String slug) {
        Post post = findPostBySlug(slug);
        if (!"PUBLISHED".equals(post.getStatus())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "文章不存在");
        }
        return post;
    }
}
