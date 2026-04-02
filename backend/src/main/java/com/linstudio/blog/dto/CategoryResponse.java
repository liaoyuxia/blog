package com.linstudio.blog.dto;

public class CategoryResponse {
    private final String name;
    private final long count;

    public CategoryResponse(String name, long count) {
        this.name = name;
        this.count = count;
    }

    public String getName() {
        return name;
    }

    public long getCount() {
        return count;
    }
}
