package com.linstudio.blog.dto;

import java.util.List;

public class PostPageResponse {
    private final List<PostSummaryResponse> items;
    private final int page;
    private final int pageSize;
    private final long totalItems;
    private final int totalPages;

    public PostPageResponse(List<PostSummaryResponse> items, int page, int pageSize, long totalItems, int totalPages) {
        this.items = items;
        this.page = page;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
    }

    public List<PostSummaryResponse> getItems() {
        return items;
    }

    public int getPage() {
        return page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public long getTotalItems() {
        return totalItems;
    }

    public int getTotalPages() {
        return totalPages;
    }
}
