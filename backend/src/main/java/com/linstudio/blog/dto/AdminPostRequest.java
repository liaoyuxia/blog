package com.linstudio.blog.dto;

import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class AdminPostRequest {
    @NotBlank(message = "文章标题不能为空")
    @Size(max = 160, message = "文章标题不能超过 160 个字符")
    private String title;

    @NotBlank(message = "文章别名不能为空")
    @Size(max = 120, message = "文章别名不能超过 120 个字符")
    private String slug;

    @NotBlank(message = "文章摘要不能为空")
    @Size(max = 280, message = "文章摘要不能超过 280 个字符")
    private String excerpt;

    @NotBlank(message = "文章内容不能为空")
    private String content;

    @Size(max = 220, message = "封面样式不能超过 220 个字符")
    private String cover;

    @NotBlank(message = "阅读时长不能为空")
    @Size(max = 40, message = "阅读时长不能超过 40 个字符")
    private String readingTime;

    @Size(max = 160, message = "推荐理由（中文）不能超过 160 个字符")
    private String recommendedForZh;

    @Size(max = 160, message = "推荐理由（英文）不能超过 160 个字符")
    private String recommendedForEn;

    @NotBlank(message = "发布日期不能为空")
    private String publishedAt;

    private boolean featured;

    private boolean starterRecommended;

    private boolean homepageSelected;

    private Integer sortWeight;

    @NotBlank(message = "文章状态不能为空")
    @Size(max = 20, message = "文章状态不能超过 20 个字符")
    private String status;

    @NotBlank(message = "文章分类不能为空")
    @Size(max = 60, message = "文章分类不能超过 60 个字符")
    private String category;

    @NotNull(message = "文章标签不能为空")
    @NotEmpty(message = "请至少填写一个标签")
    private List<@NotBlank(message = "标签不能为空") @Size(max = 60, message = "标签不能超过 60 个字符") String> tags;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCover() {
        return cover;
    }

    public void setCover(String cover) {
        this.cover = cover;
    }

    public String getReadingTime() {
        return readingTime;
    }

    public void setReadingTime(String readingTime) {
        this.readingTime = readingTime;
    }

    public String getRecommendedForZh() {
        return recommendedForZh;
    }

    public void setRecommendedForZh(String recommendedForZh) {
        this.recommendedForZh = recommendedForZh;
    }

    public String getRecommendedForEn() {
        return recommendedForEn;
    }

    public void setRecommendedForEn(String recommendedForEn) {
        this.recommendedForEn = recommendedForEn;
    }

    public String getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(String publishedAt) {
        this.publishedAt = publishedAt;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public boolean isStarterRecommended() {
        return starterRecommended;
    }

    public void setStarterRecommended(boolean starterRecommended) {
        this.starterRecommended = starterRecommended;
    }

    public boolean isHomepageSelected() {
        return homepageSelected;
    }

    public void setHomepageSelected(boolean homepageSelected) {
        this.homepageSelected = homepageSelected;
    }

    public Integer getSortWeight() {
        return sortWeight;
    }

    public void setSortWeight(Integer sortWeight) {
        this.sortWeight = sortWeight;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
