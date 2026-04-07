package com.linstudio.blog.controller;

import com.linstudio.blog.dto.UploadAssetResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.util.unit.DataSize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/uploads")
public class AdminUploadController {
    private final Path uploadPath;

    public AdminUploadController(@Value("${app.upload-dir:uploads}") String uploadDirectory) {
        this.uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    }

    @PostMapping("/cover")
    @ResponseStatus(HttpStatus.CREATED)
    public UploadAssetResponse uploadCover(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请选择要上传的封面文件");
        }

        if (file.getSize() > DataSize.ofMegabytes(5).toBytes()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "封面文件不能超过 5MB");
        }

        String contentType = StringUtils.defaultString(file.getContentType());
        if (!contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "仅支持上传图片文件");
        }

        Files.createDirectories(uploadPath);

        String originalFilename = StringUtils.defaultString(file.getOriginalFilename(), "cover");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String fileName = "cover-" + UUID.randomUUID().toString().replace("-", "") + extension;
        Path targetFile = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

        return new UploadAssetResponse("/uploads/" + fileName);
    }
}
