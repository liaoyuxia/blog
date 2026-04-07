package com.linstudio.blog.service;

import com.linstudio.blog.dto.CategoryResponse;
import com.linstudio.blog.dto.AdminSiteSettingsRequest;
import com.linstudio.blog.dto.AdminSiteSettingsResponse;
import com.linstudio.blog.dto.SiteProfileResponse;
import com.linstudio.blog.dto.SiteStatsResponse;
import com.linstudio.blog.dto.TagResponse;
import com.linstudio.blog.entity.SiteSettings;
import com.linstudio.blog.repository.CategoryRepository;
import com.linstudio.blog.repository.MessageRepository;
import com.linstudio.blog.repository.PostRepository;
import com.linstudio.blog.repository.SiteSettingsRepository;
import com.linstudio.blog.repository.TagRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SiteService {
    private static final Long SETTINGS_ID = 1L;

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final MessageRepository messageRepository;
    private final SiteSettingsRepository siteSettingsRepository;

    public SiteService(
        PostRepository postRepository,
        CategoryRepository categoryRepository,
        TagRepository tagRepository,
        MessageRepository messageRepository,
        SiteSettingsRepository siteSettingsRepository
    ) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.messageRepository = messageRepository;
        this.siteSettingsRepository = siteSettingsRepository;
    }

    @Transactional(readOnly = true)
    public SiteProfileResponse getProfile() {
        SiteSettings settings = getSettings();
        return new SiteProfileResponse(
            settings.getBrandName(),
            settings.getAvatarUrl(),
            settings.getRoleZh(),
            settings.getRoleEn(),
            settings.getRoleZh(),
            settings.getBioZh(),
            settings.getBioEn(),
            settings.getBioZh(),
            settings.getLocationZh(),
            settings.getLocationEn(),
            settings.getLocationZh(),
            settings.getEmail(),
            splitLines(settings.getSpecialtiesZh()),
            splitLines(settings.getSpecialtiesEn()),
            splitLines(settings.getSpecialtiesZh()),
            settings.getHomeAboutTitleZh(),
            settings.getHomeAboutTitleEn(),
            settings.getHomeAboutDescriptionZh(),
            settings.getHomeAboutDescriptionEn(),
            settings.getHomePillarsTitleZh(),
            settings.getHomePillarsTitleEn(),
            splitLines(settings.getHomePillarsZh()),
            splitLines(settings.getHomePillarsEn()),
            settings.getHomeJourneyTitleZh(),
            settings.getHomeJourneyTitleEn(),
            settings.getHomeJourneyDescriptionZh(),
            settings.getHomeJourneyDescriptionEn(),
            settings.getFooterProductZh(),
            settings.getFooterProductEn(),
            settings.getFooterStackZh(),
            settings.getFooterStackEn()
        );
    }

    @Transactional(readOnly = true)
    public SiteStatsResponse getStats() {
        SiteSettings settings = getSettings();
        return new SiteStatsResponse(
            postRepository.count(),
            categoryRepository.count(),
            tagRepository.count(),
            messageRepository.count(),
            Math.max(settings.getVisitCount(), postRepository.sumViewCount())
        );
    }

    @Transactional(readOnly = true)
    public AdminSiteSettingsResponse getAdminSettings() {
        return toAdminSettingsResponse(getSettings());
    }

    @Transactional
    public AdminSiteSettingsResponse updateSettings(AdminSiteSettingsRequest request) {
        SiteSettings settings = getSettings();
        settings.setBrandName(clean(request.getBrandName()));
        settings.setAvatarUrl(cleanNullable(request.getAvatarUrl()));
        settings.setRoleZh(clean(request.getRoleZh()));
        settings.setRoleEn(clean(request.getRoleEn()));
        settings.setBioZh(clean(request.getBioZh()));
        settings.setBioEn(clean(request.getBioEn()));
        settings.setLocationZh(clean(request.getLocationZh()));
        settings.setLocationEn(clean(request.getLocationEn()));
        settings.setEmail(clean(request.getEmail()));
        settings.setSpecialtiesZh(joinLines(request.getSpecialtiesZh()));
        settings.setSpecialtiesEn(joinLines(request.getSpecialtiesEn()));
        settings.setHomeAboutTitleZh(clean(request.getHomeAboutTitleZh()));
        settings.setHomeAboutTitleEn(clean(request.getHomeAboutTitleEn()));
        settings.setHomeAboutDescriptionZh(clean(request.getHomeAboutDescriptionZh()));
        settings.setHomeAboutDescriptionEn(clean(request.getHomeAboutDescriptionEn()));
        settings.setHomePillarsTitleZh(clean(request.getHomePillarsTitleZh()));
        settings.setHomePillarsTitleEn(clean(request.getHomePillarsTitleEn()));
        settings.setHomePillarsZh(joinLines(request.getHomePillarsZh()));
        settings.setHomePillarsEn(joinLines(request.getHomePillarsEn()));
        settings.setHomeJourneyTitleZh(clean(request.getHomeJourneyTitleZh()));
        settings.setHomeJourneyTitleEn(clean(request.getHomeJourneyTitleEn()));
        settings.setHomeJourneyDescriptionZh(clean(request.getHomeJourneyDescriptionZh()));
        settings.setHomeJourneyDescriptionEn(clean(request.getHomeJourneyDescriptionEn()));
        settings.setFooterProductZh(clean(request.getFooterProductZh()));
        settings.setFooterProductEn(clean(request.getFooterProductEn()));
        settings.setFooterStackZh(clean(request.getFooterStackZh()));
        settings.setFooterStackEn(clean(request.getFooterStackEn()));
        return toAdminSettingsResponse(siteSettingsRepository.save(settings));
    }

    @Transactional
    public long recordVisit() {
        SiteSettings settings = getSettings();
        settings.setVisitCount(settings.getVisitCount() + 1);
        return siteSettingsRepository.save(settings).getVisitCount();
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.fetchCategorySummaries();
    }

    public List<TagResponse> getTags() {
        return tagRepository.fetchTagSummaries();
    }

    private SiteSettings getSettings() {
        return siteSettingsRepository.findById(SETTINGS_ID).orElseGet(() -> {
            SiteSettings settings = new SiteSettings();
            settings.setId(SETTINGS_ID);
            settings.setBrandName("Bing Studio");
            settings.setRoleZh("独立开发者 / 内容系统设计实践者");
            settings.setRoleEn("Independent developer / content system practitioner");
            settings.setBioZh("围绕个人博客、内容平台与前端体验，记录一个正式项目从信息架构到工程落地的过程。");
            settings.setBioEn("A running record of personal blog architecture, backend implementation, frontend experience, and sustainable publishing workflows.");
            settings.setLocationZh("中国·上海");
            settings.setLocationEn("Shanghai, China");
            settings.setEmail("hello@bingstudio.dev");
            settings.setSpecialtiesZh("个人博客信息架构\nSpring Boot 内容后台\nReact 阅读体验设计");
            settings.setSpecialtiesEn("Personal blog information architecture\nSpring Boot publishing backend\nReact reading experience design");
            settings.setHomeAboutTitleZh("一个更像作品封面的首页");
            settings.setHomeAboutTitleEn("A homepage designed like a cover");
            settings.setHomeAboutDescriptionZh("首页更像博客封面，负责建立作者气质和阅读入口，完整文章浏览则集中在文章归档中。");
            settings.setHomeAboutDescriptionEn("The homepage behaves more like a cover: it sets the tone first, then hands deeper reading over to the archive.");
            settings.setHomePillarsTitleZh("首页保留的内容");
            settings.setHomePillarsTitleEn("What stays on the homepage");
            settings.setHomePillarsZh("作者身份、博客气质与整体方向\n精选文章预告与站点状态信号\n即时搜索入口与搜索结果展开区\n跳转到文章归档继续阅读与留言");
            settings.setHomePillarsEn("Author identity, tone, and editorial framing\nFeatured story previews and site pulse\nInstant search with in-place result expansion\nClear entry points into the article archive");
            settings.setHomeJourneyTitleZh("阅读路径");
            settings.setHomeJourneyTitleEn("Reading flow");
            settings.setHomeJourneyDescriptionZh("先在首页建立兴趣，再进入文章归档阅读、筛选主题或留下反馈，首页与归档页的职责会更清晰。");
            settings.setHomeJourneyDescriptionEn("Start on the homepage, then move into the article archive for browsing, filtering, and reader feedback.");
            settings.setFooterProductZh("Bing Studio Blog");
            settings.setFooterProductEn("Bing Studio Blog");
            settings.setFooterStackZh("React + Spring Boot + MySQL");
            settings.setFooterStackEn("React + Spring Boot + MySQL");
            settings.setVisitCount(0L);
            return siteSettingsRepository.save(settings);
        });
    }

    private AdminSiteSettingsResponse toAdminSettingsResponse(SiteSettings settings) {
        return new AdminSiteSettingsResponse(
            settings.getBrandName(),
            settings.getAvatarUrl(),
            settings.getRoleZh(),
            settings.getRoleEn(),
            settings.getBioZh(),
            settings.getBioEn(),
            settings.getLocationZh(),
            settings.getLocationEn(),
            settings.getEmail(),
            splitLines(settings.getSpecialtiesZh()),
            splitLines(settings.getSpecialtiesEn()),
            settings.getHomeAboutTitleZh(),
            settings.getHomeAboutTitleEn(),
            settings.getHomeAboutDescriptionZh(),
            settings.getHomeAboutDescriptionEn(),
            settings.getHomePillarsTitleZh(),
            settings.getHomePillarsTitleEn(),
            splitLines(settings.getHomePillarsZh()),
            splitLines(settings.getHomePillarsEn()),
            settings.getHomeJourneyTitleZh(),
            settings.getHomeJourneyTitleEn(),
            settings.getHomeJourneyDescriptionZh(),
            settings.getHomeJourneyDescriptionEn(),
            settings.getFooterProductZh(),
            settings.getFooterProductEn(),
            settings.getFooterStackZh(),
            settings.getFooterStackEn(),
            settings.getVisitCount()
        );
    }

    private List<String> splitLines(String rawValue) {
        List<String> result = new ArrayList<String>();
        if (rawValue == null || rawValue.trim().isEmpty()) {
            return result;
        }

        for (String item : rawValue.split("\\r?\\n")) {
            String cleaned = item.trim();
            if (!cleaned.isEmpty()) {
                result.add(cleaned);
            }
        }
        return result;
    }

    private String joinLines(List<String> values) {
        return values.stream()
            .map(this::clean)
            .filter(value -> !value.isEmpty())
            .collect(Collectors.joining("\n"));
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private String cleanNullable(String value) {
        String cleaned = clean(value);
        return cleaned.isEmpty() ? null : cleaned;
    }
}
