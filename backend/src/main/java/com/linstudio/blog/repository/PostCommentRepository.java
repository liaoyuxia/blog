package com.linstudio.blog.repository;

import com.linstudio.blog.entity.Post;
import com.linstudio.blog.entity.PostComment;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findAllByOrderByCreatedAtDesc();

    Page<PostComment> findAllByPostOrderByCreatedAtDesc(Post post, Pageable pageable);

    long countByPost(Post post);
}
