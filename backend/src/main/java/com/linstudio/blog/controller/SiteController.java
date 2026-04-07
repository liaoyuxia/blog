package com.linstudio.blog.controller;

import com.linstudio.blog.dto.CategoryResponse;
import com.linstudio.blog.dto.SiteProfileResponse;
import com.linstudio.blog.dto.SiteStatsResponse;
import com.linstudio.blog.dto.TagResponse;
import com.linstudio.blog.service.SiteService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SiteController {
    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return java.util.Collections.singletonMap("status", "ok");
    }

    @GetMapping("/profile")
    public SiteProfileResponse profile() {
        return siteService.getProfile();
    }

    @GetMapping("/stats")
    public SiteStatsResponse stats() {
        return siteService.getStats();
    }

    @PostMapping("/visits")
    public Map<String, Long> recordVisit() {
        return java.util.Collections.singletonMap("visitCount", siteService.recordVisit());
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return siteService.getCategories();
    }

    @GetMapping("/tags")
    public List<TagResponse> tags() {
        return siteService.getTags();
    }
}
