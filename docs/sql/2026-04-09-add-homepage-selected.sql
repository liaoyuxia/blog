SET @add_post_homepage_selected = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN homepage_selected BOOLEAN NOT NULL DEFAULT FALSE',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'homepage_selected'
);
PREPARE stmt_add_post_homepage_selected FROM @add_post_homepage_selected;
EXECUTE stmt_add_post_homepage_selected;
DEALLOCATE PREPARE stmt_add_post_homepage_selected;

UPDATE posts
SET homepage_selected = TRUE
WHERE id IN (2, 3)
  AND status = 'PUBLISHED';
