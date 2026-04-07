import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  createPostComment,
  createMessage,
  fetchCategories,
  fetchMessages,
  fetchPostDetail,
  fetchPostPage,
  fetchPosts,
  fetchProfile,
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
  localizeCategoryItem,
  localizeMessage,
  localizePost,
  localizeProfile,
  localizeTagItem,
  translateTagName,
} from "./i18n";

const initialForm = {
  name: "",
  email: "",
  content: "",
};
const PAGE_SIZE = 6;

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

export default function BlogJournal({ language, onLanguageChange, initialSection }) {
  const LIKED_POSTS_STORAGE_KEY = "lin-blog-liked-posts";
  const copy = getPublicCopy(language);
  const postsSectionRef = useRef(null);
  const messagesSectionRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchLayerRef = useRef(null);
  const searchTimerRef = useRef(0);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    tag: "",
  });
  const [formData, setFormData] = useState(initialForm);
  const [formStatus, setFormStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchRendered, setSearchRendered] = useState(false);
  const [tagExpanded, setTagExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const isMessagesView = initialSection === "messages";

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        const [profileData, categoryData, tagData, messageData, postData] = await Promise.all([
          fetchProfile(),
          fetchCategories(),
          fetchTags(),
          fetchMessages(),
          fetchPostPage({ page: 1, pageSize: PAGE_SIZE }),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setCategories(categoryData);
        setTags(tagData);
        setMessages(messageData);
        setPosts(postData.items);
        setCurrentPage(postData.page);
        setTotalPages(postData.totalPages);
        setTotalItems(postData.totalItems);
        setError("");

        recordVisit().catch(() => {});
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
    if (loading) {
      return;
    }

    let mounted = true;

    async function loadFilteredPosts() {
      try {
        setPostsLoading(true);
        const data = await fetchPostPage({
          category: filters.category,
          tag: filters.tag,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });

        if (mounted) {
          setPosts(data.items);
          setCurrentPage(data.page);
          setTotalPages(data.totalPages);
          setTotalItems(data.totalItems);
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setError(copy.postLoadError);
        }
      } finally {
        if (mounted) {
          setPostsLoading(false);
        }
      }
    }

    loadFilteredPosts();
    return () => {
      mounted = false;
    };
  }, [copy.postLoadError, currentPage, filters.category, filters.tag, loading]);

  useEffect(() => {
    window.localStorage.setItem(LIKED_POSTS_STORAGE_KEY, JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setError(""), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [error]);

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

  useEffect(() => {
    if (!searchRendered || !searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let mounted = true;

    async function loadSearchResults() {
      try {
        setSearchLoading(true);
        const data = await fetchPosts({ q: searchQuery.trim(), limit: 6 });

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
  }, [copy.postLoadError, searchQuery, searchRendered]);

  useEffect(() => () => window.clearTimeout(searchTimerRef.current), []);

  useEffect(() => {
    if (!formStatus || formStatus === copy.submitting) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setFormStatus(""), 3800);
    return () => window.clearTimeout(timeoutId);
  }, [copy.submitting, formStatus]);

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

      if (event.key === "Escape" && searchRendered) {
        collapseSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchRendered]);

  useEffect(() => {
    if (isMessagesView) {
      requestAnimationFrame(() => {
        messagesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [isMessagesView]);

  const localizedProfile = localizeProfile(profile, language);
  const localizedCategories = categories.map((item) => localizeCategoryItem(item, language));
  const localizedTags = tags.map((item) => localizeTagItem(item, language));
  const localizedPosts = posts.map((item) => localizePost(item, language));
  const localizedMessages = messages.map((item) => localizeMessage(item, language));
  const localizedSearchResults = searchResults.map((item) => localizePost(item, language));
  const hasPagination = totalPages > 1;
  const visibleTags = localizedTags.slice(0, 10);
  const activeCategory = filters.category
    ? localizedCategories.find((item) => item.name === filters.category)
    : null;
  const heroMetaItems = isMessagesView
    ? [localizedProfile?.name, localizedProfile?.location, localizedProfile?.email].filter(Boolean)
    : [
        copy.journalCountSummary(totalItems),
        activeCategory?.label || copy.allCategories,
        filters.tag ? `#${translateTagName(filters.tag, language)}` : null,
      ].filter(Boolean);

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.category) {
      const category = localizedCategories.find((item) => item.name === filters.category);
      chips.push({ key: "category", label: category?.label || filters.category });
    }
    if (filters.tag) {
      chips.push({ key: "tag", label: `#${translateTagName(filters.tag, language)}` });
    }
    return chips;
  }, [filters.category, filters.tag, language, localizedCategories]);

  function openSearch() {
    window.clearTimeout(searchTimerRef.current);
    setSearchRendered(true);
    requestAnimationFrame(() => setSearchExpanded(true));
  }

  function clearFilters() {
    startTransition(() => {
      setFilters({ category: "", tag: "" });
      setCurrentPage(1);
    });
    setTagExpanded(false);
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

    setPosts((current) =>
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
    setPosts((current) =>
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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus(copy.submitting);

    try {
      const created = await createMessage(formData);
      setMessages((current) => [created, ...current]);
      setFormData(initialForm);
      setFormStatus(copy.submitSuccess);
      setError("");
    } catch (requestError) {
      setFormStatus(copy.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">{copy.pageLoading}</div>;
  }

  return (
    <div className="page-shell journal-page">
      <header className="topbar journal-topbar">
        <div className={`journal-topbar-main ${searchExpanded ? "is-muted" : ""}`}>
          <div className="brand">
            <BrandMark avatarUrl={localizedProfile?.avatarUrl} name={localizedProfile?.name} />
            <div>
              <span className="eyebrow">{copy.journalEyebrow}</span>
              <strong>{localizedProfile?.name || copy.journalTitle}</strong>
            </div>
          </div>

          <div className="journal-topbar-actions">
            <nav className="journal-nav">
              <a href="#/">{copy.navHome}</a>
              <a href="#/journal/posts">{copy.navPosts}</a>
              <a href="#/journal/messages">{copy.navContact}</a>
            </nav>

            <div className="topbar-tools journal-tools">
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

      <main className="journal-main">
        <section className="journal-hero panel">
          <div className="journal-hero-copy">
            <div className="hero-identity">
              <div className="hero-identity-copy">
                <h1>{isMessagesView ? copy.connectTitle : copy.journalTitle}</h1>
              </div>
            </div>
            <p className="hero-bio">{isMessagesView ? copy.connectDescription : copy.journalDescription}</p>
          </div>
          <div className="journal-hero-meta">
            {heroMetaItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        {!isMessagesView ? (
          <section className="content-section" id="posts" ref={postsSectionRef}>
            <SectionTitle title={copy.journalBrowseTitle} />

            <div className="discover-layout">
              <div className="discover-main discover-main-wide">
                <div className="panel control-deck">
                  <div className="control-deck-header control-deck-header-minimal">
                    <span className="filter-result-count">{copy.journalCountSummary(totalItems)}</span>
                    {activeChips.length ? (
                      <button className="button secondary" type="button" onClick={clearFilters}>
                        {copy.clearFilters}
                      </button>
                    ) : null}
                  </div>

                  <div className="control-deck-body control-deck-body-open">
                    <div className="control-deck-toolbar">
                      <div className="quick-tag-cloud category-chip-row">
                        <button
                          type="button"
                          className={`pill tag-button ${!filters.category ? "active-pill" : ""}`}
                          onClick={() =>
                            startTransition(() => {
                              setFilters((current) => ({ ...current, category: "" }));
                              setCurrentPage(1);
                            })
                          }
                        >
                          {copy.allCategories}
                        </button>
                        {localizedCategories.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            className={`pill tag-button ${filters.category === item.name ? "active-pill" : ""}`}
                            onClick={() =>
                              startTransition(() => {
                                setFilters((current) => ({
                                  ...current,
                                  category: current.category === item.name ? "" : item.name,
                                }));
                                setCurrentPage(1);
                              })
                            }
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className={`pill tag-button topic-toggle-button ${tagExpanded ? "active-pill" : ""}`}
                        aria-label={copy.topicFilterToggle}
                        onClick={() => setTagExpanded((current) => !current)}
                      >
                        #
                      </button>
                    </div>

                    {tagExpanded ? (
                      <div className="quick-tag-cloud quick-tag-tray">
                        {visibleTags.map((tag) => (
                          <button
                            key={tag.name}
                            type="button"
                            className={`pill tag-button ${filters.tag === tag.name ? "active-pill" : ""}`}
                            onClick={() =>
                              startTransition(() => {
                                setFilters((current) => ({
                                  ...current,
                                  tag: current.tag === tag.name ? "" : tag.name,
                                }));
                                setCurrentPage(1);
                              })
                            }
                          >
                            #{tag.label}
                          </button>
                        ))}
                        {localizedTags.length > 10 ? (
                          <button
                            type="button"
                            className="pill tag-button tag-toggle-button"
                            onClick={() => setTagExpanded(false)}
                          >
                            {copy.tagCollapse}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  {activeChips.length ? (
                    <div className="chip-row active control-chip-row">
                      {activeChips.map((chip) => (
                        <span key={chip.key} className="pill active-pill">
                          {chip.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {postsLoading ? <div className="empty-card">{copy.loadingPosts}</div> : null}
                {!postsLoading && !localizedPosts.length ? (
                  <div className="empty-card">{copy.emptyPosts}</div>
                ) : null}

                <div className="editorial-list">
                  {localizedPosts.map((post, index) => (
                    <article key={post.slug} className="panel editorial-card">
                      <div className="editorial-index">
                        {String((currentPage - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                      </div>
                      <div className="editorial-body">
                        <div className="meta-row">
                          <span>{post.category}</span>
                          <span>{post.publishedAt}</span>
                          <span>{post.readingTime}</span>
                        </div>
                        <button
                          type="button"
                          className="editorial-link"
                          disabled={detailLoadingSlug === post.slug}
                          onClick={() => openPost(post.slug)}
                        >
                          <h4>{post.title}</h4>
                        </button>
                        <p>{post.excerpt}</p>
                        <div className="post-signal-row">
                          <span>{post.viewCount} {copy.statsViews}</span>
                          <span>{post.likeCount} {copy.statsLikes}</span>
                          <span>{post.commentCount} {copy.statsComments}</span>
                        </div>
                        <div className="chip-row">
                          {posts[index].tags.slice(0, 2).map((rawTag, tagIndex) => (
                            <button
                              key={`${post.slug}-${rawTag}`}
                              type="button"
                              className={`pill tag-button ${filters.tag === rawTag ? "active-pill" : ""}`}
                              onClick={() =>
                                startTransition(() => {
                                  setFilters((current) => ({
                                    ...current,
                                    tag: current.tag === rawTag ? "" : rawTag,
                                  }));
                                  setCurrentPage(1);
                                })
                              }
                            >
                              #{post.tags[tagIndex] || translateTagName(rawTag, language)}
                            </button>
                          ))}
                          {posts[index].tags.length > 2 ? (
                            <span className="pill soft">+{posts[index].tags.length - 2}</span>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {hasPagination ? (
                  <div className="pagination-bar panel">
                    <button
                      className="button secondary"
                      type="button"
                      disabled={currentPage <= 1 || postsLoading}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    >
                      {copy.paginationPrevious}
                    </button>
                    <span className="pagination-label">
                      {copy.paginationLabel(currentPage, totalPages)} · {totalItems} {copy.postCountSuffix}
                    </span>
                    <button
                      className="button secondary"
                      type="button"
                      disabled={currentPage >= totalPages || postsLoading}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    >
                      {copy.paginationNext}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {isMessagesView ? (
          <section className="content-section" id="messages" ref={messagesSectionRef}>
            <div className="contact-layout">
              <form className="panel form-card message-form-card" onSubmit={handleSubmit}>
                <label>
                  <span>{copy.formName}</span>
                  <input
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder={copy.formNamePlaceholder}
                    required
                  />
                </label>
                <label>
                  <span>{copy.formEmail}</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="your@email.com"
                    required
                  />
                </label>
                <label>
                  <span>{copy.formContent}</span>
                  <textarea
                    rows="6"
                    value={formData.content}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, content: event.target.value }))
                    }
                    placeholder={copy.formContentPlaceholder}
                    required
                  />
                </label>
                <button className="button primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? copy.submitting : copy.submitMessage}
                </button>
                <p className="form-status" aria-live="polite">
                  {formStatus}
                </p>
              </form>

              <div className="panel message-card conversation-card">
                <div className="subheading">
                  <h3>{copy.latestMessages}</h3>
                  <span>{copy.latestMessagesCaption}</span>
                </div>
                <div className="message-list">
                  {localizedMessages.length ? (
                    localizedMessages.map((message) => (
                      <article key={message.id} className="message-item">
                        <strong>{message.name}</strong>
                        <p>{message.content}</p>
                        <span>{message.createdAt}</span>
                      </article>
                    ))
                  ) : (
                    <div className="empty-card">{copy.emptyMessagesPublic}</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="footer">
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
