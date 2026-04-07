package com.linstudio.blog.dto;

public class AdminSessionResponse {
    private final String username;
    private final String role;

    public AdminSessionResponse(String username, String role) {
        this.username = username;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }
}
