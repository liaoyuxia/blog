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
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

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
