package com.linstudio.blog.dto;

public class UploadAssetResponse {
    private final String url;

    public UploadAssetResponse(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }
}
