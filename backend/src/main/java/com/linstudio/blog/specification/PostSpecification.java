package com.linstudio.blog.specification;

import com.linstudio.blog.entity.Post;
import com.linstudio.blog.entity.Tag;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class PostSpecification {
    private PostSpecification() {
    }

    public static Specification<Post> byFilters(String keyword, String category, String tag, Boolean featured) {
        return (root, query, builder) -> {
            query.distinct(true);

            List<Predicate> predicates = new ArrayList<Predicate>();

            if (featured != null) {
                predicates.add(builder.equal(root.get("featured"), featured));
            }

            if (StringUtils.hasText(category)) {
                predicates.add(
                    builder.equal(
                        builder.lower(root.get("category").get("name")),
                        category.trim().toLowerCase()
                    )
                );
            }

            if (StringUtils.hasText(tag)) {
                Join<Post, Tag> tagJoin = root.join("tags", JoinType.INNER);
                predicates.add(builder.equal(builder.lower(tagJoin.get("name")), tag.trim().toLowerCase()));
            }

            if (StringUtils.hasText(keyword)) {
                String likeValue = "%" + keyword.trim().toLowerCase() + "%";
                Join<Post, Tag> tagJoin = root.join("tags", JoinType.LEFT);

                predicates.add(
                    builder.or(
                        builder.like(builder.lower(root.get("title")), likeValue),
                        builder.like(builder.lower(root.get("excerpt")), likeValue),
                        builder.like(builder.lower(root.get("content")), likeValue),
                        builder.like(builder.lower(root.get("category").get("name")), likeValue),
                        builder.like(builder.lower(tagJoin.get("name")), likeValue)
                    )
                );
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
