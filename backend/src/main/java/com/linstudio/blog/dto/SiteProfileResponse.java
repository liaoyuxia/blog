package com.linstudio.blog.dto;

import java.util.List;

public class SiteProfileResponse {
    private final String name;
    private final String role;
    private final String bio;
    private final String location;
    private final String email;
    private final List<String> specialties;

    public SiteProfileResponse(
        String name,
        String role,
        String bio,
        String location,
        String email,
        List<String> specialties
    ) {
        this.name = name;
        this.role = role;
        this.bio = bio;
        this.location = location;
        this.email = email;
        this.specialties = specialties;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getBio() {
        return bio;
    }

    public String getLocation() {
        return location;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getSpecialties() {
        return specialties;
    }
}
