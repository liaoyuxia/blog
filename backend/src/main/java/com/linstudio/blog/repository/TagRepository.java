package com.linstudio.blog.repository;

import com.linstudio.blog.dto.TagResponse;
import com.linstudio.blog.entity.Tag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TagRepository extends JpaRepository<Tag, Long> {
    @Query("select new com.linstudio.blog.dto.TagResponse(t.name, count(p.id)) " +
        "from Tag t left join t.posts p group by t.id, t.name order by count(p.id) desc, t.name asc")
    List<TagResponse> fetchTagSummaries();
}
