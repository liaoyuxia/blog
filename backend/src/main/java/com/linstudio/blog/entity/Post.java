package com.linstudio.blog.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.Lob;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 280)
    private String excerpt;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(length = 220)
    private String cover;

    @Column(name = "reading_time", length = 40)
    private String readingTime;

    @Column(name = "recommended_for_zh", length = 160)
    private String recommendedForZh;

    @Column(name = "recommended_for_en", length = 160)
    private String recommendedForEn;

    @Column(name = "starter_recommended", nullable = false)
    private boolean starterRecommended;

    @Column(name = "homepage_selected", nullable = false)
    private boolean homepageSelected;

    @Column(name = "sort_weight", nullable = false)
    private int sortWeight;

    @Column(name = "published_at", nullable = false)
    private LocalDate publishedAt;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "view_count", nullable = false)
    private long viewCount;

    @Column(name = "like_count", nullable = false)
    private long likeCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags = new ArrayList<Tag>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<PostComment> comments = new ArrayList<PostComment>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public int getSortWeight() {
        return sortWeight;
    }

    public void setSortWeight(int sortWeight) {
        this.sortWeight = sortWeight;
    }

    public LocalDate getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDate publishedAt) {
        this.publishedAt = publishedAt;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getViewCount() {
        return viewCount;
    }

    public void setViewCount(long viewCount) {
        this.viewCount = viewCount;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(long likeCount) {
        this.likeCount = likeCount;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    public List<PostComment> getComments() {
        return comments;
    }

    public void setComments(List<PostComment> comments) {
        this.comments = comments;
    }
}
