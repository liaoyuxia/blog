package com.linstudio.blog.repository;

import com.linstudio.blog.entity.Post;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Post> findAllByFeaturedTrue();

    List<Post> findAllByHomepageSelectedTrue();

    @Query("select coalesce(sum(p.viewCount), 0) from Post p")
    long sumViewCount();
}
