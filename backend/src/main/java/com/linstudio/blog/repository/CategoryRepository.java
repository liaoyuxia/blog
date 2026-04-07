package com.linstudio.blog.repository;

import com.linstudio.blog.dto.CategoryResponse;
import com.linstudio.blog.entity.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    @Query("select new com.linstudio.blog.dto.CategoryResponse(c.name, count(p.id)) " +
        "from Category c left join c.posts p group by c.id, c.name order by count(p.id) desc, c.name asc")
    List<CategoryResponse> fetchCategorySummaries();
}
