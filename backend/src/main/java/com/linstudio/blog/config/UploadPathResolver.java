package com.linstudio.blog.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class UploadPathResolver {
    private UploadPathResolver() {
    }

    public static Path resolve(String uploadDirectory) {
        Path configuredPath = Paths.get(uploadDirectory);
        if (configuredPath.isAbsolute()) {
            return configuredPath.normalize();
        }

        Path workingDirectory = Paths.get("").toAbsolutePath().normalize();
        Path defaultPath = workingDirectory.resolve(uploadDirectory).normalize();
        Path backendPath = workingDirectory.resolve("backend").resolve(uploadDirectory).normalize();

        if (Files.exists(backendPath) || Files.exists(workingDirectory.resolve("backend"))) {
            return backendPath;
        }

        return defaultPath;
    }
}
