CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(160) NOT NULL,
    excerpt VARCHAR(280) NOT NULL,
    content LONGTEXT NOT NULL,
    cover VARCHAR(220),
    reading_time VARCHAR(40),
    published_at DATE NOT NULL,
    featured BOOLEAN NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

SET @add_post_status = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''PUBLISHED''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'status'
);
PREPARE stmt_add_post_status FROM @add_post_status;
EXECUTE stmt_add_post_status;
DEALLOCATE PREPARE stmt_add_post_status;

SET @add_post_view_count = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN view_count BIGINT NOT NULL DEFAULT 0',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'view_count'
);
PREPARE stmt_add_post_view_count FROM @add_post_view_count;
EXECUTE stmt_add_post_view_count;
DEALLOCATE PREPARE stmt_add_post_view_count;

SET @add_post_like_count = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN like_count BIGINT NOT NULL DEFAULT 0',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'like_count'
);
PREPARE stmt_add_post_like_count FROM @add_post_like_count;
EXECUTE stmt_add_post_like_count;
DEALLOCATE PREPARE stmt_add_post_like_count;

CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts (id),
    CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id)
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS post_comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_post_comments_post FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT PRIMARY KEY,
    brand_name VARCHAR(80) NOT NULL,
    avatar_url VARCHAR(255),
    role_zh VARCHAR(160) NOT NULL,
    role_en VARCHAR(160) NOT NULL,
    bio_zh LONGTEXT NOT NULL,
    bio_en LONGTEXT NOT NULL,
    location_zh VARCHAR(120) NOT NULL,
    location_en VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    specialties_zh LONGTEXT NOT NULL,
    specialties_en LONGTEXT NOT NULL,
    home_about_title_zh VARCHAR(160) NOT NULL,
    home_about_title_en VARCHAR(160) NOT NULL,
    home_about_description_zh LONGTEXT NOT NULL,
    home_about_description_en LONGTEXT NOT NULL,
    home_pillars_title_zh VARCHAR(160) NOT NULL,
    home_pillars_title_en VARCHAR(160) NOT NULL,
    home_pillars_zh LONGTEXT NOT NULL,
    home_pillars_en LONGTEXT NOT NULL,
    home_journey_title_zh VARCHAR(160) NOT NULL,
    home_journey_title_en VARCHAR(160) NOT NULL,
    home_journey_description_zh LONGTEXT NOT NULL,
    home_journey_description_en LONGTEXT NOT NULL,
    footer_product_zh VARCHAR(120) NOT NULL,
    footer_product_en VARCHAR(120) NOT NULL,
    footer_stack_zh VARCHAR(120) NOT NULL,
    footer_stack_en VARCHAR(120) NOT NULL,
    visit_count BIGINT NOT NULL
);
