package com.linstudio.blog.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class MessageRequest {
    @NotBlank(message = "昵称不能为空")
    @Size(max = 80, message = "昵称长度不能超过 80 个字符")
    private String name;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Size(max = 120, message = "邮箱长度不能超过 120 个字符")
    private String email;

    @NotBlank(message = "留言内容不能为空")
    @Size(max = 1000, message = "留言内容不能超过 1000 个字符")
    private String content;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
