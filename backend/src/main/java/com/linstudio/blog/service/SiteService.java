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
            settings.getHeroEyebrowZh(),
            settings.getHeroEyebrowEn(),
            settings.getHeroTitleZh(),
            settings.getHeroTitleEn(),
            settings.getHeroDescriptionZh(),
            settings.getHeroDescriptionEn(),
            settings.getOnboardingTitleZh(),
            settings.getOnboardingTitleEn(),
            settings.getOnboardingDescriptionZh(),
            settings.getOnboardingDescriptionEn(),
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
            settings.getSubscribeTitleZh(),
            settings.getSubscribeTitleEn(),
            settings.getSubscribeDescriptionZh(),
            settings.getSubscribeDescriptionEn(),
            settings.getSubscribeLinkLabelZh(),
            settings.getSubscribeLinkLabelEn(),
            settings.getSubscribeLinkUrl(),
            settings.getJournalTitleZh(),
            settings.getJournalTitleEn(),
            settings.getJournalDescriptionZh(),
            settings.getJournalDescriptionEn(),
            settings.getMessageTitleZh(),
            settings.getMessageTitleEn(),
            settings.getMessageDescriptionZh(),
            settings.getMessageDescriptionEn(),
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
        settings.setHeroEyebrowZh(clean(request.getHeroEyebrowZh()));
        settings.setHeroEyebrowEn(clean(request.getHeroEyebrowEn()));
        settings.setHeroTitleZh(clean(request.getHeroTitleZh()));
        settings.setHeroTitleEn(clean(request.getHeroTitleEn()));
        settings.setHeroDescriptionZh(clean(request.getHeroDescriptionZh()));
        settings.setHeroDescriptionEn(clean(request.getHeroDescriptionEn()));
        settings.setOnboardingTitleZh(clean(request.getOnboardingTitleZh()));
        settings.setOnboardingTitleEn(clean(request.getOnboardingTitleEn()));
        settings.setOnboardingDescriptionZh(clean(request.getOnboardingDescriptionZh()));
        settings.setOnboardingDescriptionEn(clean(request.getOnboardingDescriptionEn()));
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
        settings.setSubscribeTitleZh(clean(request.getSubscribeTitleZh()));
        settings.setSubscribeTitleEn(clean(request.getSubscribeTitleEn()));
        settings.setSubscribeDescriptionZh(clean(request.getSubscribeDescriptionZh()));
        settings.setSubscribeDescriptionEn(clean(request.getSubscribeDescriptionEn()));
        settings.setSubscribeLinkLabelZh(clean(request.getSubscribeLinkLabelZh()));
        settings.setSubscribeLinkLabelEn(clean(request.getSubscribeLinkLabelEn()));
        settings.setSubscribeLinkUrl(clean(request.getSubscribeLinkUrl()));
        settings.setJournalTitleZh(clean(request.getJournalTitleZh()));
        settings.setJournalTitleEn(clean(request.getJournalTitleEn()));
        settings.setJournalDescriptionZh(clean(request.getJournalDescriptionZh()));
        settings.setJournalDescriptionEn(clean(request.getJournalDescriptionEn()));
        settings.setMessageTitleZh(clean(request.getMessageTitleZh()));
        settings.setMessageTitleEn(clean(request.getMessageTitleEn()));
        settings.setMessageDescriptionZh(clean(request.getMessageDescriptionZh()));
        settings.setMessageDescriptionEn(clean(request.getMessageDescriptionEn()));
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
            settings.setHeroEyebrowZh("内容系统 · 技术实践 · 阅读体验");
            settings.setHeroEyebrowEn("Content systems · Technical practice · Reading experience");
            settings.setHeroTitleZh("把内容站点做成可持续增长的产品");
            settings.setHeroTitleEn("Turn a content site into a product that keeps compounding");
            settings.setHeroDescriptionZh("这里整理内容架构、后台实现、阅读体验和持续运营方法，帮助你更快搭建、优化和迭代自己的内容站点。");
            settings.setHeroDescriptionEn("Find practical notes on content architecture, backend delivery, reading experience, and editorial operations so you can ship and improve your own content site faster.");
            settings.setOnboardingTitleZh("第一次来，建议从这几篇开始");
            settings.setOnboardingTitleEn("Start here if this is your first visit");
            settings.setOnboardingDescriptionZh("如果你想快速理解这个站点关注的问题和方法，这 3 篇最适合作为起点。");
            settings.setOnboardingDescriptionEn("These three articles give you the fastest path into the problems and methods this site focuses on.");
            settings.setHomeAboutTitleZh("你能在这里获得什么");
            settings.setHomeAboutTitleEn("What you can get from this site");
            settings.setHomeAboutDescriptionZh("这里的内容重点不是展示，而是把从搭建到运营的关键方法拆清楚，方便你直接理解和参考。");
            settings.setHomeAboutDescriptionEn("The focus here is not self-display. It is to break the important steps from setup to operations into usable patterns you can apply directly.");
            settings.setHomePillarsTitleZh("核心内容方向");
            settings.setHomePillarsTitleEn("Core content tracks");
            settings.setHomePillarsZh("搭建方法｜从信息架构、分类标签到后台字段设计，梳理完整搭建路径。\n优化经验｜从首屏理解、阅读动线到转化承接，持续沉淀可复用的体验方案。\n运营思路｜关注更新节奏、回访机制和内容效率，而不只停留在页面展示。");
            settings.setHomePillarsEn("Build systems｜Map the full setup path from information architecture and taxonomy to backend fields.\nExperience tuning｜Capture reusable interface patterns for first-screen clarity, reading flow, and conversion handoffs.\nEditorial operations｜Focus on publishing cadence, return loops, and content efficiency instead of surface polish alone.");
            settings.setHomeJourneyTitleZh("阅读路径");
            settings.setHomeJourneyTitleEn("Reading path");
            settings.setHomeJourneyDescriptionZh("先看新手导读，再按主题筛选、继续延伸阅读，最后通过更新提醒形成回访习惯。");
            settings.setHomeJourneyDescriptionEn("Start with the guided entry points, continue with topic-based browsing, and return later through a lightweight update reminder.");
            settings.setSubscribeTitleZh("有新内容时提醒我");
            settings.setSubscribeTitleEn("Let me know when something new is published");
            settings.setSubscribeDescriptionZh("如果你对内容系统、技术实践和阅读体验优化感兴趣，可以在更新时收到提醒。");
            settings.setSubscribeDescriptionEn("If you care about content systems, technical practice, and reading experience, you can get a lightweight update reminder when new work is published.");
            settings.setSubscribeLinkLabelZh("查看订阅方式");
            settings.setSubscribeLinkLabelEn("See subscription options");
            settings.setSubscribeLinkUrl("mailto:hello@bingstudio.dev?subject=Bing%20Studio%20Updates");
            settings.setJournalTitleZh("文章与专题");
            settings.setJournalTitleEn("Articles and topics");
            settings.setJournalDescriptionZh("按主题浏览已经发布的内容，快速找到你当前最关心的问题。");
            settings.setJournalDescriptionEn("Browse published articles by theme and quickly find the question you care about most right now.");
            settings.setMessageTitleZh("交流与反馈");
            settings.setMessageTitleEn("Feedback and conversation");
            settings.setMessageDescriptionZh("如果你对内容结构、后台设计或阅读体验优化有问题，可以直接在这里交流。");
            settings.setMessageDescriptionEn("If you have questions about content structure, backend design, or reading experience improvements, you can leave them here directly.");
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
            settings.getHeroEyebrowZh(),
            settings.getHeroEyebrowEn(),
            settings.getHeroTitleZh(),
            settings.getHeroTitleEn(),
            settings.getHeroDescriptionZh(),
            settings.getHeroDescriptionEn(),
            settings.getOnboardingTitleZh(),
            settings.getOnboardingTitleEn(),
            settings.getOnboardingDescriptionZh(),
            settings.getOnboardingDescriptionEn(),
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
            settings.getSubscribeTitleZh(),
            settings.getSubscribeTitleEn(),
            settings.getSubscribeDescriptionZh(),
            settings.getSubscribeDescriptionEn(),
            settings.getSubscribeLinkLabelZh(),
            settings.getSubscribeLinkLabelEn(),
            settings.getSubscribeLinkUrl(),
            settings.getJournalTitleZh(),
            settings.getJournalTitleEn(),
            settings.getJournalDescriptionZh(),
            settings.getJournalDescriptionEn(),
            settings.getMessageTitleZh(),
            settings.getMessageTitleEn(),
            settings.getMessageDescriptionZh(),
            settings.getMessageDescriptionEn(),
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
