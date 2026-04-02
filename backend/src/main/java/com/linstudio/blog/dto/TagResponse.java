package com.linstudio.blog.dto;

public class TagResponse {
    private final String name;
    private final long count;

    public TagResponse(String name, long count) {
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
