package com.linstudio.blog.service;

import com.linstudio.blog.dto.CategoryResponse;
import com.linstudio.blog.dto.SiteProfileResponse;
import com.linstudio.blog.dto.SiteStatsResponse;
import com.linstudio.blog.dto.TagResponse;
import com.linstudio.blog.repository.CategoryRepository;
import com.linstudio.blog.repository.MessageRepository;
import com.linstudio.blog.repository.PostRepository;
import com.linstudio.blog.repository.TagRepository;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SiteService {
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final MessageRepository messageRepository;

    public SiteService(
        PostRepository postRepository,
        CategoryRepository categoryRepository,
        TagRepository tagRepository,
        MessageRepository messageRepository
    ) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.messageRepository = messageRepository;
    }

    public SiteProfileResponse getProfile() {
        return new SiteProfileResponse(
            "Lin Studio",
            "独立开发者 / 设计向写作者",
            "记录界面设计、Java 项目实践、个人写作流程与可持续创作，让作品、思考和生活感落在同一个数字花园里。",
            "Shanghai, China",
            "hello@linstudio.dev",
            Arrays.asList("视觉化博客设计", "Spring Boot 内容平台", "创作型个人品牌")
        );
    }

    public SiteStatsResponse getStats() {
        return new SiteStatsResponse(
            postRepository.count(),
            categoryRepository.count(),
            tagRepository.count(),
            messageRepository.count()
        );
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.fetchCategorySummaries();
    }

    public List<TagResponse> getTags() {
        return tagRepository.fetchTagSummaries();
    }
}
