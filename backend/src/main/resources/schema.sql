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
    recommended_for_zh VARCHAR(160),
    recommended_for_en VARCHAR(160),
    starter_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    homepage_selected BOOLEAN NOT NULL DEFAULT FALSE,
    sort_weight INT NOT NULL DEFAULT 0,
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

SET @add_post_recommended_for_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN recommended_for_zh VARCHAR(160)',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'recommended_for_zh'
);
PREPARE stmt_add_post_recommended_for_zh FROM @add_post_recommended_for_zh;
EXECUTE stmt_add_post_recommended_for_zh;
DEALLOCATE PREPARE stmt_add_post_recommended_for_zh;

SET @add_post_recommended_for_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN recommended_for_en VARCHAR(160)',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'recommended_for_en'
);
PREPARE stmt_add_post_recommended_for_en FROM @add_post_recommended_for_en;
EXECUTE stmt_add_post_recommended_for_en;
DEALLOCATE PREPARE stmt_add_post_recommended_for_en;

SET @add_post_starter_recommended = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN starter_recommended BOOLEAN NOT NULL DEFAULT FALSE',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'starter_recommended'
);
PREPARE stmt_add_post_starter_recommended FROM @add_post_starter_recommended;
EXECUTE stmt_add_post_starter_recommended;
DEALLOCATE PREPARE stmt_add_post_starter_recommended;

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

SET @add_post_sort_weight = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE posts ADD COLUMN sort_weight INT NOT NULL DEFAULT 0',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'posts' AND COLUMN_NAME = 'sort_weight'
);
PREPARE stmt_add_post_sort_weight FROM @add_post_sort_weight;
EXECUTE stmt_add_post_sort_weight;
DEALLOCATE PREPARE stmt_add_post_sort_weight;

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
    hero_eyebrow_zh VARCHAR(160) NOT NULL,
    hero_eyebrow_en VARCHAR(160) NOT NULL,
    hero_title_zh VARCHAR(200) NOT NULL,
    hero_title_en VARCHAR(200) NOT NULL,
    hero_description_zh LONGTEXT NOT NULL,
    hero_description_en LONGTEXT NOT NULL,
    onboarding_title_zh VARCHAR(160) NOT NULL,
    onboarding_title_en VARCHAR(160) NOT NULL,
    onboarding_description_zh LONGTEXT NOT NULL,
    onboarding_description_en LONGTEXT NOT NULL,
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
    subscribe_title_zh VARCHAR(160) NOT NULL,
    subscribe_title_en VARCHAR(160) NOT NULL,
    subscribe_description_zh LONGTEXT NOT NULL,
    subscribe_description_en LONGTEXT NOT NULL,
    subscribe_link_label_zh VARCHAR(120) NOT NULL,
    subscribe_link_label_en VARCHAR(120) NOT NULL,
    subscribe_link_url VARCHAR(255) NOT NULL,
    journal_title_zh VARCHAR(160) NOT NULL,
    journal_title_en VARCHAR(160) NOT NULL,
    journal_description_zh LONGTEXT NOT NULL,
    journal_description_en LONGTEXT NOT NULL,
    message_title_zh VARCHAR(160) NOT NULL,
    message_title_en VARCHAR(160) NOT NULL,
    message_description_zh LONGTEXT NOT NULL,
    message_description_en LONGTEXT NOT NULL,
    footer_product_zh VARCHAR(120) NOT NULL,
    footer_product_en VARCHAR(120) NOT NULL,
    footer_stack_zh VARCHAR(120) NOT NULL,
    footer_stack_en VARCHAR(120) NOT NULL,
    visit_count BIGINT NOT NULL
);

SET @add_settings_hero_eyebrow_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN hero_eyebrow_zh VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hero_eyebrow_zh'
);
PREPARE stmt_add_settings_hero_eyebrow_zh FROM @add_settings_hero_eyebrow_zh;
EXECUTE stmt_add_settings_hero_eyebrow_zh;
DEALLOCATE PREPARE stmt_add_settings_hero_eyebrow_zh;

SET @add_settings_hero_eyebrow_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN hero_eyebrow_en VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hero_eyebrow_en'
);
PREPARE stmt_add_settings_hero_eyebrow_en FROM @add_settings_hero_eyebrow_en;
EXECUTE stmt_add_settings_hero_eyebrow_en;
DEALLOCATE PREPARE stmt_add_settings_hero_eyebrow_en;

SET @add_settings_hero_title_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN hero_title_zh VARCHAR(200) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hero_title_zh'
);
PREPARE stmt_add_settings_hero_title_zh FROM @add_settings_hero_title_zh;
EXECUTE stmt_add_settings_hero_title_zh;
DEALLOCATE PREPARE stmt_add_settings_hero_title_zh;

SET @add_settings_hero_title_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN hero_title_en VARCHAR(200) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hero_title_en'
);
PREPARE stmt_add_settings_hero_title_en FROM @add_settings_hero_title_en;
EXECUTE stmt_add_settings_hero_title_en;
DEALLOCATE PREPARE stmt_add_settings_hero_title_en;

SET @add_settings_hero_description_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN hero_description_zh LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hero_description_zh'
);
PREPARE stmt_add_settings_hero_description_zh FROM @add_settings_hero_description_zh;
EXECUTE stmt_add_settings_hero_description_zh;
DEALLOCATE PREPARE stmt_add_settings_hero_description_zh;

SET @add_settings_hero_description_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN hero_description_en LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'hero_description_en'
);
PREPARE stmt_add_settings_hero_description_en FROM @add_settings_hero_description_en;
EXECUTE stmt_add_settings_hero_description_en;
DEALLOCATE PREPARE stmt_add_settings_hero_description_en;

SET @add_settings_onboarding_title_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN onboarding_title_zh VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'onboarding_title_zh'
);
PREPARE stmt_add_settings_onboarding_title_zh FROM @add_settings_onboarding_title_zh;
EXECUTE stmt_add_settings_onboarding_title_zh;
DEALLOCATE PREPARE stmt_add_settings_onboarding_title_zh;

SET @add_settings_onboarding_title_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN onboarding_title_en VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'onboarding_title_en'
);
PREPARE stmt_add_settings_onboarding_title_en FROM @add_settings_onboarding_title_en;
EXECUTE stmt_add_settings_onboarding_title_en;
DEALLOCATE PREPARE stmt_add_settings_onboarding_title_en;

SET @add_settings_onboarding_description_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN onboarding_description_zh LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'onboarding_description_zh'
);
PREPARE stmt_add_settings_onboarding_description_zh FROM @add_settings_onboarding_description_zh;
EXECUTE stmt_add_settings_onboarding_description_zh;
DEALLOCATE PREPARE stmt_add_settings_onboarding_description_zh;

SET @add_settings_onboarding_description_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN onboarding_description_en LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'onboarding_description_en'
);
PREPARE stmt_add_settings_onboarding_description_en FROM @add_settings_onboarding_description_en;
EXECUTE stmt_add_settings_onboarding_description_en;
DEALLOCATE PREPARE stmt_add_settings_onboarding_description_en;

SET @add_settings_subscribe_title_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN subscribe_title_zh VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'subscribe_title_zh'
);
PREPARE stmt_add_settings_subscribe_title_zh FROM @add_settings_subscribe_title_zh;
EXECUTE stmt_add_settings_subscribe_title_zh;
DEALLOCATE PREPARE stmt_add_settings_subscribe_title_zh;

SET @add_settings_subscribe_title_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN subscribe_title_en VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'subscribe_title_en'
);
PREPARE stmt_add_settings_subscribe_title_en FROM @add_settings_subscribe_title_en;
EXECUTE stmt_add_settings_subscribe_title_en;
DEALLOCATE PREPARE stmt_add_settings_subscribe_title_en;

SET @add_settings_subscribe_description_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN subscribe_description_zh LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'subscribe_description_zh'
);
PREPARE stmt_add_settings_subscribe_description_zh FROM @add_settings_subscribe_description_zh;
EXECUTE stmt_add_settings_subscribe_description_zh;
DEALLOCATE PREPARE stmt_add_settings_subscribe_description_zh;

SET @add_settings_subscribe_description_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN subscribe_description_en LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'subscribe_description_en'
);
PREPARE stmt_add_settings_subscribe_description_en FROM @add_settings_subscribe_description_en;
EXECUTE stmt_add_settings_subscribe_description_en;
DEALLOCATE PREPARE stmt_add_settings_subscribe_description_en;

SET @add_settings_subscribe_link_label_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN subscribe_link_label_zh VARCHAR(120) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'subscribe_link_label_zh'
);
PREPARE stmt_add_settings_subscribe_link_label_zh FROM @add_settings_subscribe_link_label_zh;
EXECUTE stmt_add_settings_subscribe_link_label_zh;
DEALLOCATE PREPARE stmt_add_settings_subscribe_link_label_zh;

SET @add_settings_subscribe_link_label_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN subscribe_link_label_en VARCHAR(120) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'subscribe_link_label_en'
);
PREPARE stmt_add_settings_subscribe_link_label_en FROM @add_settings_subscribe_link_label_en;
EXECUTE stmt_add_settings_subscribe_link_label_en;
DEALLOCATE PREPARE stmt_add_settings_subscribe_link_label_en;

SET @add_settings_subscribe_link_url = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN subscribe_link_url VARCHAR(255) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'subscribe_link_url'
);
PREPARE stmt_add_settings_subscribe_link_url FROM @add_settings_subscribe_link_url;
EXECUTE stmt_add_settings_subscribe_link_url;
DEALLOCATE PREPARE stmt_add_settings_subscribe_link_url;

SET @add_settings_journal_title_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN journal_title_zh VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'journal_title_zh'
);
PREPARE stmt_add_settings_journal_title_zh FROM @add_settings_journal_title_zh;
EXECUTE stmt_add_settings_journal_title_zh;
DEALLOCATE PREPARE stmt_add_settings_journal_title_zh;

SET @add_settings_journal_title_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN journal_title_en VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'journal_title_en'
);
PREPARE stmt_add_settings_journal_title_en FROM @add_settings_journal_title_en;
EXECUTE stmt_add_settings_journal_title_en;
DEALLOCATE PREPARE stmt_add_settings_journal_title_en;

SET @add_settings_journal_description_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN journal_description_zh LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'journal_description_zh'
);
PREPARE stmt_add_settings_journal_description_zh FROM @add_settings_journal_description_zh;
EXECUTE stmt_add_settings_journal_description_zh;
DEALLOCATE PREPARE stmt_add_settings_journal_description_zh;

SET @add_settings_journal_description_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN journal_description_en LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'journal_description_en'
);
PREPARE stmt_add_settings_journal_description_en FROM @add_settings_journal_description_en;
EXECUTE stmt_add_settings_journal_description_en;
DEALLOCATE PREPARE stmt_add_settings_journal_description_en;

SET @add_settings_message_title_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN message_title_zh VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'message_title_zh'
);
PREPARE stmt_add_settings_message_title_zh FROM @add_settings_message_title_zh;
EXECUTE stmt_add_settings_message_title_zh;
DEALLOCATE PREPARE stmt_add_settings_message_title_zh;

SET @add_settings_message_title_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN message_title_en VARCHAR(160) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'message_title_en'
);
PREPARE stmt_add_settings_message_title_en FROM @add_settings_message_title_en;
EXECUTE stmt_add_settings_message_title_en;
DEALLOCATE PREPARE stmt_add_settings_message_title_en;

SET @add_settings_message_description_zh = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN message_description_zh LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'message_description_zh'
);
PREPARE stmt_add_settings_message_description_zh FROM @add_settings_message_description_zh;
EXECUTE stmt_add_settings_message_description_zh;
DEALLOCATE PREPARE stmt_add_settings_message_description_zh;

SET @add_settings_message_description_en = (
    SELECT IF(
        COUNT(*) = 0,
        'ALTER TABLE site_settings ADD COLUMN message_description_en LONGTEXT',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings' AND COLUMN_NAME = 'message_description_en'
);
PREPARE stmt_add_settings_message_description_en FROM @add_settings_message_description_en;
EXECUTE stmt_add_settings_message_description_en;
DEALLOCATE PREPARE stmt_add_settings_message_description_en;
