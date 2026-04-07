import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  createPostComment,
  fetchPostDetail,
  fetchPosts,
  fetchProfile,
  fetchStats,
  fetchTags,
  likePost,
  recordPostView,
  recordVisit,
  unlikePost,
} from "./api/blog";
import PostModal from "./components/PostModal";
import SectionTitle from "./components/SectionTitle";
import {
  getPublicCopy,
  localizePost,
  localizeProfile,
  localizeTagItem,
} from "./i18n";

function LanguageSwitcher({ language, onLanguageChange, copy }) {
  return (
    <div className="language-switch" aria-label="language switch">
      <button
        className={language === "zh" ? "language-pill active-language" : "language-pill"}
        onClick={() => onLanguageChange("zh")}
        type="button"
      >
        {copy.languageZh}
      </button>
      <button
        className={language === "en" ? "language-pill active-language" : "language-pill"}
        onClick={() => onLanguageChange("en")}
        type="button"
      >
        {copy.languageEn}
      </button>
    </div>
  );
}

function BrandMark({ avatarUrl, name }) {
  return (
    <div className={`brand-mark ${avatarUrl ? "brand-mark-avatar" : ""}`}>
      {avatarUrl ? <img src={avatarUrl} alt={name || "Bing Studio"} /> : "BS"}
    </div>
  );
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.isContentEditable)
  );
}

export default function BlogHome({ language, onLanguageChange }) {
  const LIKED_POSTS_STORAGE_KEY = "lin-blog-liked-posts";
  const copy = getPublicCopy(language);
  const searchInputRef = useRef(null);
  const searchLayerRef = useRef(null);
  const searchTimerRef = useRef(0);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [tags, setTags] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchRendered, setSearchRendered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailLoadingSlug, setDetailLoadingSlug] = useState("");
  const [likeLoadingSlug, setLikeLoadingSlug] = useState("");
  const [commentSubmittingSlug, setCommentSubmittingSlug] = useState("");
  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(LIKED_POSTS_STORAGE_KEY) || "[]");
    } catch (error) {
      return [];
    }
  });
  const [error, setError] = useState("");

  const deferredKeyword = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        const [profileData, statsData, tagData, featuredData] = await Promise.all([
          fetchProfile(),
          fetchStats(),
          fetchTags(),
          fetchPosts({ featured: true, limit: 4 }),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setStats(statsData);
        setTags(tagData);
        setFeaturedPosts(featuredData);
        setError("");

        recordVisit()
          .then(() => fetchStats())
          .then((latestStats) => {
            if (mounted) {
              setStats(latestStats);
            }
          })
          .catch(() => {});
      } catch (requestError) {
        if (mounted) {
          setError(copy.initError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!deferredKeyword) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let mounted = true;

    async function loadSearchResults() {
      try {
        setSearchLoading(true);
        const data = await fetchPosts({ q: deferredKeyword, limit: 6 });

        if (mounted) {
          setSearchResults(data);
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setError(copy.postLoadError);
        }
      } finally {
        if (mounted) {
          setSearchLoading(false);
        }
      }
    }

    loadSearchResults();
    return () => {
      mounted = false;
    };
  }, [copy.postLoadError, deferredKeyword]);

  useEffect(() => {
    window.localStorage.setItem(LIKED_POSTS_STORAGE_KEY, JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    if (!searchExpanded || !searchRendered) {
      return;
    }

    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchExpanded, searchRendered]);

  useEffect(() => {
    if (!searchRendered) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (searchLayerRef.current?.contains(event.target)) {
        return;
      }

      collapseSearch();
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [searchRendered]);

  useEffect(() => () => window.clearTimeout(searchTimerRef.current), []);

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setError(""), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [error]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault();
        openSearch();
        return;
      }

      if (event.key !== "Escape") {
        return;
      }

      if (selectedPost) {
        setSelectedPost(null);
        return;
      }

      if (searchRendered || searchQuery) {
        collapseSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchRendered, searchQuery, selectedPost]);

  const localizedProfile = localizeProfile(profile, language);
  const localizedTags = tags.map((item) => localizeTagItem(item, language)).slice(0, 5);
  const localizedFeaturedPosts = featuredPosts.map((item) => localizePost(item, language));
  const localizedSearchResults = searchResults.map((item) => localizePost(item, language));
  const topStories = localizedFeaturedPosts.slice(0, 3);

  function openSearch() {
    window.clearTimeout(searchTimerRef.current);
    setSearchRendered(true);
    requestAnimationFrame(() => setSearchExpanded(true));
  }

  function collapseSearch() {
    window.clearTimeout(searchTimerRef.current);
    searchInputRef.current?.blur();
    setSearchExpanded(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchLoading(false);
    searchTimerRef.current = window.setTimeout(() => setSearchRendered(false), 240);
  }

  function applyEngagement(slug, engagement) {
    if (!engagement) {
      return;
    }

    setFeaturedPosts((current) =>
      current.map((item) => (item.slug === slug ? { ...item, ...engagement } : item))
    );
    setSearchResults((current) =>
      current.map((item) => (item.slug === slug ? { ...item, ...engagement } : item))
    );
    setSelectedPost((current) =>
      current?.slug === slug ? { ...current, ...engagement } : current
    );
  }

  function incrementCommentCount(slug) {
    setFeaturedPosts((current) =>
      current.map((item) =>
        item.slug === slug ? { ...item, commentCount: (item.commentCount || 0) + 1 } : item
      )
    );
    setSearchResults((current) =>
      current.map((item) =>
        item.slug === slug ? { ...item, commentCount: (item.commentCount || 0) + 1 } : item
      )
    );
  }

  async function openPost(slug) {
    try {
      setDetailLoadingSlug(slug);
      const detail = await fetchPostDetail(slug);
      setSelectedPost(detail);
      setError("");

      recordPostView(slug)
        .then((engagement) => {
          setSelectedPost((current) =>
            current?.slug === slug ? { ...current, ...engagement } : current
          );
          applyEngagement(slug, engagement);
        })
        .catch(() => {});
    } catch (requestError) {
      setError(copy.detailLoadError);
    } finally {
      setDetailLoadingSlug("");
    }
  }

  function openPostFromSearch(slug) {
    collapseSearch();
    openPost(slug);
  }

  async function handleToggleLike(slug, isLiked) {
    try {
      setLikeLoadingSlug(slug);
      const engagement = isLiked ? await unlikePost(slug) : await likePost(slug);
      applyEngagement(slug, engagement);
      setLikedPosts((current) =>
        isLiked ? current.filter((item) => item !== slug) : Array.from(new Set([...current, slug]))
      );
      setError(isLiked ? copy.articleUnliked : copy.articleLiked);
    } catch (requestError) {
      setError(requestError.message || copy.detailLoadError);
    } finally {
      setLikeLoadingSlug("");
    }
  }

  async function handleSubmitComment(slug, payload) {
    try {
      setCommentSubmittingSlug(slug);
      const createdComment = await createPostComment(slug, payload);
      setSelectedPost((current) => {
        if (!current || current.slug !== slug) {
          return current;
        }

        return {
          ...current,
          comments: [createdComment, ...(current.comments || [])],
          commentCount: (current.commentCount || 0) + 1,
        };
      });
      incrementCommentCount(slug);
      return createdComment;
    } finally {
      setCommentSubmittingSlug("");
    }
  }

  if (loading) {
    return <div className="loading-screen">{copy.pageLoading}</div>;
  }

  return (
    <div className="page-shell atelier-home">
      <header className="topbar atelier-topbar">
        <div className={`atelier-topbar-row ${searchExpanded ? "is-muted" : ""}`}>
          <div className="brand atelier-brand">
            <BrandMark avatarUrl={localizedProfile?.avatarUrl} name={localizedProfile?.name} />
            <div className="atelier-brand-copy">
              <span className="eyebrow">{copy.brandEyebrow}</span>
              <strong>{localizedProfile?.name || copy.brandTitle}</strong>
            </div>
          </div>

          <div className="atelier-topbar-actions">
            <nav className="atelier-nav">
              <a href="#/journal/posts">{copy.navPosts}</a>
              <a href="#about">{copy.navAbout}</a>
              <a href="#/journal/messages">{copy.navContact}</a>
            </nav>

            <div className="topbar-tools atelier-tools">
              <LanguageSwitcher
                language={language}
                onLanguageChange={onLanguageChange}
                copy={copy}
              />
              <button
                className="search-command"
                type="button"
                aria-label={copy.searchOpenLabel}
                onClick={openSearch}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M16.2 16.2L21 21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {searchRendered ? (
          <div className={`atelier-topbar-search-stack ${searchExpanded ? "is-active" : "is-idle"}`} ref={searchLayerRef}>
            <div className="atelier-topbar-search-row">
              <div className={`atelier-search-shell ${searchExpanded ? "is-active" : "is-idle"}`}>
                <button
                  className="search-command is-active atelier-search-toggle"
                  type="button"
                  aria-label={copy.searchCloseLabel}
                  onClick={collapseSearch}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M16.2 16.2L21 21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <label className="atelier-search-input-wrap">
                  <span className="sr-only">{copy.searchLabel}</span>
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={copy.searchPlaceholder}
                  />
                </label>
              </div>
            </div>

            <div className={`atelier-search-dropdown ${searchExpanded ? "is-active" : "is-idle"}`}>
              {searchLoading ? (
                <div className="search-state-card">{copy.loadingPosts}</div>
              ) : searchQuery && !localizedSearchResults.length ? (
                <div className="search-state-card">{copy.emptyPosts}</div>
              ) : searchQuery ? (
                <div className="search-result-grid search-result-grid-compact">
                  {localizedSearchResults.map((post) => (
                    <article key={post.slug} className="search-result-card">
                      <div className="meta-row">
                        <span>{post.category}</span>
                        <span>{post.publishedAt}</span>
                      </div>
                      <button
                        type="button"
                        className="search-result-button"
                        disabled={detailLoadingSlug === post.slug}
                        onClick={() => openPostFromSearch(post.slug)}
                      >
                        <h3>{post.title}</h3>
                      </button>
                      <p>{post.excerpt}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="search-prompt-card search-prompt-card-compact">
                  <strong>{copy.searchPromptTitle}</strong>
                  <p>{copy.searchPromptDescription}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="atelier-main">
        <section className="atelier-stage">
          <div className="atelier-primary-column">
            <article className="panel atelier-manifesto">
              <p className="eyebrow">{copy.heroEyebrow}</p>
              <div className="hero-identity">
                <div className="hero-identity-copy">
                  <h1>{localizedProfile?.name}</h1>
                  <p className="atelier-role">{localizedProfile?.role}</p>
                </div>
              </div>
              <p className="hero-bio">{localizedProfile?.bio}</p>

              <div className="hero-actions">
                <a className="button primary" href="#/journal/posts">
                  {copy.enterJournal}
                </a>
                <a className="button secondary" href="#/journal/messages">
                  {copy.leaveFeedback}
                </a>
              </div>

              <div className="atelier-rule" />

              <div className="atelier-tag-cloud">
                {localizedTags.map((tag) => (
                  <span key={tag.name} className="pill">
                    #{tag.label}
                  </span>
                ))}
              </div>

              <div className="atelier-inline-metrics">
                <article>
                  <strong>{stats?.postCount ?? 0}</strong>
                  <span>{copy.statsPosts}</span>
                </article>
                <article>
                  <strong>{stats?.categoryCount ?? 0}</strong>
                  <span>{copy.statsCategories}</span>
                </article>
                <article>
                  <strong>{stats?.tagCount ?? 0}</strong>
                  <span>{copy.statsTags}</span>
                </article>
                <article>
                  <strong>{stats?.messageCount ?? 0}</strong>
                  <span>{copy.statsMessages}</span>
                </article>
                <article>
                  <strong>{stats?.visitCount ?? 0}</strong>
                  <span>{copy.statsVisits}</span>
                </article>
              </div>
            </article>
          </div>

          <aside className="atelier-aside">
            {topStories.map((post, index) => (
              <article
                key={post.slug}
                className={`panel atelier-lead-card atelier-top-story-card ${index === 0 ? "is-lead" : ""}`}
              >
                <div className="atelier-story-headline">
                  <span className="eyebrow">{index === 0 ? copy.featuredCaption : post.category}</span>
                  <span>{post.publishedAt}</span>
                </div>
                <button
                  type="button"
                  className="atelier-story-button"
                  disabled={detailLoadingSlug === post.slug}
                  onClick={() => openPost(post.slug)}
                >
                  <h3>{post.title}</h3>
                </button>
                <p>{post.excerpt}</p>
                <div className="post-signal-row">
                  <span>{post.viewCount} {copy.statsViews}</span>
                  <span>{post.likeCount} {copy.statsLikes}</span>
                  <span>{post.commentCount} {copy.statsComments}</span>
                </div>
              </article>
            ))}
          </aside>
        </section>

        <section className="content-section" id="about">
          <SectionTitle
            eyebrow={copy.aboutEyebrow}
            title={localizedProfile?.homeAboutTitle || copy.homeAboutTitle}
            description={localizedProfile?.homeAboutDescription || copy.homeAboutDescription}
          />

          <div className="atelier-about-grid">
            <article className="panel atelier-about-card">
              <h3>{localizedProfile?.homePillarsTitle || copy.homePillarsTitle}</h3>
              <ul className="feature-list">
                {(localizedProfile?.homePillars || copy.homePillars).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="panel atelier-about-card accent">
              <h3>{localizedProfile?.homeJourneyTitle || copy.homeJourneyTitle}</h3>
              <p>{localizedProfile?.homeJourneyDescription || copy.homeJourneyDescription}</p>
              <a className="button secondary" href="#/journal/posts">
                {copy.browsePosts}
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer atelier-footer">
        <span>{localizedProfile?.footerProduct || copy.footerProduct}</span>
        <span>{localizedProfile?.footerStack || copy.footerStack}</span>
      </footer>

      {error ? (
        <div className="toast" aria-live="polite">
          {error}
        </div>
      ) : null}

      <PostModal
        post={selectedPost ? localizePost(selectedPost, language) : null}
        onClose={() => setSelectedPost(null)}
        closeLabel={copy.closePost}
        copy={copy}
        liked={selectedPost ? likedPosts.includes(selectedPost.slug) : false}
        likePending={Boolean(selectedPost && likeLoadingSlug === selectedPost.slug)}
        commentSubmitting={Boolean(selectedPost && commentSubmittingSlug === selectedPost.slug)}
        onToggleLike={handleToggleLike}
        onSubmitComment={handleSubmitComment}
      />
    </div>
  );
}
