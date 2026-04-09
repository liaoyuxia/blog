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
import com.linstudio.blog.dto.PagedResponse;
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
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
        String sort,
        String status,
        Integer limit
    ) {
        List<Post> filteredPosts = postRepository.findAll(
                PostSpecification.byFilters(keyword, category, tag, featured),
                Sort.by(Sort.Direction.DESC, "publishedAt")
            )
            .stream()
            .filter(post -> shouldIncludeStatus(post, status))
            .collect(Collectors.toList());

        List<PostSummaryResponse> posts = sortPosts(filteredPosts, sort).stream()
            .map(this::toSummary)
            .collect(Collectors.toList());

        if (limit != null && limit > 0 && posts.size() > limit) {
            return posts.subList(0, limit);
        }

        return posts;
    }

    @Transactional(readOnly = true)
    public PostPageResponse findPostPage(
        String keyword,
        String category,
        String tag,
        String sort,
        String status,
        Integer page,
        Integer pageSize
    ) {
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : Math.min(pageSize, 24);

        List<PostSummaryResponse> filtered = sortPosts(
                postRepository.findAll(
                PostSpecification.byFilters(keyword, category, tag, null),
                Sort.by(Sort.Direction.DESC, "publishedAt")
            )
            .stream()
            .filter(post -> shouldIncludeStatus(post, status))
            .collect(Collectors.toList()),
            sort
        )
            .stream()
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
        List<Post> publicPosts = listPublicPosts();
        return toDetail(post, publicPosts);
    }

    @Transactional(readOnly = true)
    public List<PostCommentResponse> findComments(String slug) {
        return findPublicPostBySlug(slug).getComments()
            .stream()
            .map(this::toCommentResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<PostCommentResponse> findCommentPage(String slug, Integer page, Integer pageSize) {
        Post post = findPublicPostBySlug(slug);
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 10 : Math.min(pageSize, 24);
        Page<PostComment> data = postCommentRepository.findAllByPostOrderByCreatedAtDesc(
            post,
            PageRequest.of(safePage - 1, safePageSize)
        );

        return new PagedResponse<PostCommentResponse>(
            data.getContent().stream().map(this::toCommentResponse).collect(Collectors.toList()),
            data.getNumber() + 1,
            data.getSize(),
            data.getTotalElements(),
            Math.max(1, data.getTotalPages())
        );
    }

    @Transactional(readOnly = true)
    public List<AdminPostResponse> findAllForAdmin(
        String keyword,
        String status,
        Boolean featured,
        Boolean starterRecommended,
        Boolean homepageSelected
    ) {
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt"))
            .stream()
            .filter(post -> matchesAdminKeyword(post, keyword))
            .filter(post -> shouldIncludeAdminStatus(post, status))
            .filter(post -> featured == null || post.isFeatured() == featured)
            .filter(post -> starterRecommended == null || post.isStarterRecommended() == starterRecommended)
            .filter(post -> homepageSelected == null || post.isHomepageSelected() == homepageSelected)
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
        if (shouldKeepFeatured(request)) {
            clearOtherFeaturedPosts(null);
        }
        validateHomepageSelection(null, request);
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

        if (shouldKeepFeatured(request)) {
            clearOtherFeaturedPosts(post.getId());
        }
        validateHomepageSelection(post.getId(), request);
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
        boolean featured = isHomepageFeatured(post);
        return new PostSummaryResponse(
            post.getSlug(),
            post.getTitle(),
            post.getExcerpt(),
            post.getCategory().getName(),
            post.getTags().stream().map(Tag::getName).collect(Collectors.toList()),
            post.getPublishedAt().toString(),
            post.getReadingTime(),
            post.getCover(),
            post.getRecommendedForZh(),
            post.getRecommendedForEn(),
            post.isStarterRecommended(),
            post.isHomepageSelected(),
            post.getSortWeight(),
            featured,
            post.getStatus(),
            post.getViewCount(),
            post.getLikeCount(),
            post.getComments().size()
        );
    }

    private PostDetailResponse toDetail(Post post, List<Post> publicPosts) {
        List<Post> chronology = sortPosts(publicPosts, "latest");
        int currentIndex = -1;
        for (int index = 0; index < chronology.size(); index++) {
            if (Objects.equals(chronology.get(index).getSlug(), post.getSlug())) {
                currentIndex = index;
                break;
            }
        }

        PostSummaryResponse prevPost = currentIndex > 0 ? toSummary(chronology.get(currentIndex - 1)) : null;
        PostSummaryResponse nextPost = currentIndex >= 0 && currentIndex < chronology.size() - 1
            ? toSummary(chronology.get(currentIndex + 1))
            : null;

        return new PostDetailResponse(
            post.getSlug(),
            post.getTitle(),
            post.getExcerpt(),
            post.getCategory().getName(),
            post.getTags().stream().map(Tag::getName).collect(Collectors.toList()),
            post.getPublishedAt().toString(),
            post.getReadingTime(),
            post.getCover(),
            post.getRecommendedForZh(),
            post.getRecommendedForEn(),
            post.isStarterRecommended(),
            post.isHomepageSelected(),
            post.getSortWeight(),
            post.isFeatured(),
            post.getStatus(),
            post.getViewCount(),
            post.getLikeCount(),
            post.getComments().size(),
            post.getContent(),
            post.getComments().stream().map(this::toCommentResponse).collect(Collectors.toList()),
            buildRelatedPosts(post, publicPosts),
            prevPost,
            nextPost
        );
    }

    private List<PostSummaryResponse> buildRelatedPosts(Post targetPost, List<Post> publicPosts) {
        List<String> targetTags = targetPost.getTags()
            .stream()
            .map(Tag::getName)
            .collect(Collectors.toList());

        return publicPosts.stream()
            .filter(post -> !Objects.equals(post.getSlug(), targetPost.getSlug()))
            .sorted(
                Comparator
                    .comparingInt((Post post) -> relatedScore(targetPost, targetTags, post))
                    .reversed()
                    .thenComparing(Post::isFeatured, Comparator.reverseOrder())
                    .thenComparing(Post::getSortWeight, Comparator.reverseOrder())
                    .thenComparing(Post::getViewCount, Comparator.reverseOrder())
                    .thenComparing(Post::getPublishedAt, Comparator.reverseOrder())
            )
            .limit(3)
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    private int relatedScore(Post targetPost, List<String> targetTags, Post candidate) {
        int score = 0;

        if (Objects.equals(candidate.getCategory().getName(), targetPost.getCategory().getName())) {
            score += 120;
        }

        int sharedTags = 0;
        for (Tag tag : candidate.getTags()) {
            if (targetTags.contains(tag.getName())) {
                sharedTags++;
            }
        }

        score += sharedTags * 35;

        if (candidate.isStarterRecommended()) {
            score += 10;
        }

        if (candidate.isFeatured()) {
            score += 8;
        }

        score += Math.min(candidate.getSortWeight(), 20);
        score += Math.min((int) candidate.getViewCount() / 10, 12);

        return score;
    }

    private AdminPostResponse toAdminResponse(Post post) {
        boolean featured = isHomepageFeatured(post);
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
            post.getRecommendedForZh(),
            post.getRecommendedForEn(),
            featured,
            post.isStarterRecommended(),
            post.isHomepageSelected(),
            post.getSortWeight(),
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

    private List<Post> listPublicPosts() {
        return postRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt"))
            .stream()
            .filter(post -> shouldIncludeStatus(post, null))
            .collect(Collectors.toList());
    }

    private void clearOtherFeaturedPosts(Long excludeId) {
        List<Post> featuredPosts = postRepository.findAllByFeaturedTrue();
        boolean hasChanges = false;

        for (Post featuredPost : featuredPosts) {
            if (excludeId != null && Objects.equals(featuredPost.getId(), excludeId)) {
                continue;
            }

            if (featuredPost.isFeatured()) {
                featuredPost.setFeatured(false);
                hasChanges = true;
            }
        }

        if (hasChanges) {
            postRepository.saveAll(featuredPosts);
        }
    }

    private void validateHomepageSelection(Long excludeId, AdminPostRequest request) {
        boolean shouldSelectHomepage = !request.isFeatured() && request.isHomepageSelected();
        if (!shouldSelectHomepage) {
            return;
        }

        long otherSelectedCount = postRepository.findAllByHomepageSelectedTrue()
            .stream()
            .filter(post -> !post.isFeatured())
            .filter(post -> excludeId == null || !Objects.equals(post.getId(), excludeId))
            .count();

        if (otherSelectedCount >= 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "首页推荐最多只能选择两篇");
        }
    }

    private void applyAdminRequest(Post post, AdminPostRequest request, String slug) {
        String normalizedStatus = normalizeStatus(request.getStatus());
        boolean shouldKeepFeatured = request.isFeatured() && "PUBLISHED".equals(normalizedStatus);

        post.setSlug(slug);
        post.setTitle(request.getTitle().trim());
        post.setExcerpt(request.getExcerpt().trim());
        post.setContent(request.getContent().trim());
        post.setCover(request.getCover() == null ? null : request.getCover().trim());
        post.setReadingTime(request.getReadingTime().trim());
        post.setRecommendedForZh(cleanNullable(request.getRecommendedForZh()));
        post.setRecommendedForEn(cleanNullable(request.getRecommendedForEn()));
        post.setPublishedAt(parseDate(request.getPublishedAt()));
        post.setFeatured(shouldKeepFeatured);
        post.setHomepageSelected(!request.isFeatured() && request.isHomepageSelected());
        post.setStarterRecommended(request.isStarterRecommended());
        post.setSortWeight(request.getSortWeight() == null ? 0 : request.getSortWeight());
        post.setStatus(normalizedStatus);
        post.setCategory(resolveCategory(request.getCategory()));
        post.setTags(resolveTags(request.getTags()));
    }

    private boolean shouldKeepFeatured(AdminPostRequest request) {
        return request.isFeatured() && "PUBLISHED".equals(normalizeStatus(request.getStatus()));
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

    private boolean isHomepageFeatured(Post post) {
        return post.isFeatured() && "PUBLISHED".equals(post.getStatus());
    }

    private boolean shouldIncludeAdminStatus(Post post, String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (normalizedStatus.isEmpty()) {
            return true;
        }
        return normalizedStatus.equals(post.getStatus());
    }

    private boolean matchesAdminKeyword(Post post, String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return true;
        }

        String normalizedKeyword = keyword.trim().toLowerCase(Locale.ROOT);

        return containsIgnoreCase(post.getTitle(), normalizedKeyword)
            || containsIgnoreCase(post.getSlug(), normalizedKeyword)
            || containsIgnoreCase(post.getExcerpt(), normalizedKeyword)
            || containsIgnoreCase(post.getContent(), normalizedKeyword)
            || containsIgnoreCase(post.getCategory() == null ? null : post.getCategory().getName(), normalizedKeyword)
            || post.getTags().stream().anyMatch(tag -> containsIgnoreCase(tag.getName(), normalizedKeyword));
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private List<Post> sortPosts(List<Post> posts, String rawSort) {
        String normalizedSort = rawSort == null ? "latest" : rawSort.trim().toLowerCase(Locale.ROOT);
        Comparator<Post> comparator;

        switch (normalizedSort) {
            case "featured":
                comparator = Comparator
                    .comparing(Post::isFeatured, Comparator.reverseOrder())
                    .thenComparing(Post::isHomepageSelected, Comparator.reverseOrder())
                    .thenComparing(Post::isStarterRecommended, Comparator.reverseOrder())
                    .thenComparing(Post::getPublishedAt, Comparator.reverseOrder());
                break;
            case "popular":
                comparator = Comparator
                    .comparingLong((Post post) -> post.getViewCount() * 3 + post.getLikeCount() * 2 + post.getComments().size())
                    .reversed()
                    .thenComparing(Post::getSortWeight, Comparator.reverseOrder())
                    .thenComparing(Post::getPublishedAt, Comparator.reverseOrder());
                break;
            case "starter":
                comparator = Comparator
                    .comparing(Post::isStarterRecommended, Comparator.reverseOrder())
                    .thenComparing(Post::getSortWeight, Comparator.reverseOrder())
                    .thenComparing(Post::isFeatured, Comparator.reverseOrder())
                    .thenComparing(Post::getPublishedAt, Comparator.reverseOrder());
                break;
            case "latest":
            default:
                comparator = Comparator
                    .comparing(Post::getPublishedAt, Comparator.reverseOrder())
                    .thenComparing(Post::getSortWeight, Comparator.reverseOrder())
                    .thenComparing(Post::isFeatured, Comparator.reverseOrder());
                break;
        }

        return posts.stream()
            .sorted(comparator)
            .collect(Collectors.toList());
    }

    private String cleanNullable(String value) {
        if (value == null) {
            return null;
        }

        String cleaned = value.trim();
        return cleaned.isEmpty() ? null : cleaned;
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
