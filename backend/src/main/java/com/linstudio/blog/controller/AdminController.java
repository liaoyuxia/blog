package com.linstudio.blog.controller;

import com.linstudio.blog.dto.AdminMessageResponse;
import com.linstudio.blog.dto.AdminPostCommentResponse;
import com.linstudio.blog.dto.AdminPostRequest;
import com.linstudio.blog.dto.AdminPostResponse;
import com.linstudio.blog.dto.AdminSiteSettingsRequest;
import com.linstudio.blog.dto.AdminSiteSettingsResponse;
import com.linstudio.blog.dto.AdminSessionResponse;
import com.linstudio.blog.service.MessageService;
import com.linstudio.blog.service.PostService;
import com.linstudio.blog.service.SiteService;
import java.security.Principal;
import java.util.List;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final PostService postService;
    private final MessageService messageService;
    private final SiteService siteService;

    public AdminController(PostService postService, MessageService messageService, SiteService siteService) {
        this.postService = postService;
        this.messageService = messageService;
        this.siteService = siteService;
    }

    @GetMapping("/session")
    public AdminSessionResponse session(Principal principal) {
        return new AdminSessionResponse(principal.getName(), "ADMIN");
    }

    @GetMapping("/settings")
    public AdminSiteSettingsResponse settings() {
        return siteService.getAdminSettings();
    }

    @PutMapping("/settings")
    public AdminSiteSettingsResponse updateSettings(@Valid @RequestBody AdminSiteSettingsRequest request) {
        return siteService.updateSettings(request);
    }

    @GetMapping("/posts")
    public List<AdminPostResponse> listPosts() {
        return postService.findAllForAdmin();
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminPostResponse createPost(@Valid @RequestBody AdminPostRequest request) {
        return postService.create(request);
    }

    @PutMapping("/posts/{id}")
    public AdminPostResponse updatePost(@PathVariable("id") Long id, @Valid @RequestBody AdminPostRequest request) {
        return postService.update(id, request);
    }

    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable("id") Long id) {
        postService.delete(id);
    }

    @GetMapping("/messages")
    public List<AdminMessageResponse> listMessages() {
        return messageService.findAllForAdmin();
    }

    @GetMapping("/comments")
    public List<AdminPostCommentResponse> listComments() {
        return postService.findAllCommentsForAdmin();
    }

    @DeleteMapping("/messages/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable("id") Long id) {
        messageService.delete(id);
    }

    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable("id") Long id) {
        postService.deleteComment(id);
    }
}
