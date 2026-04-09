import { startTransition, useEffect, useRef, useState } from "react";
import {
  createMessage,
  fetchMessages,
  fetchPosts,
  fetchPostPage,
  fetchProfile,
  recordVisit,
} from "./api/blog";
import SectionTitle from "./components/SectionTitle";
import {
  getPublicCopy,
  localizeMessage,
  localizePost,
  localizeProfile,
} from "./i18n";

const initialForm = {
  name: "",
  email: "",
  content: "",
};
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20];

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
  const copy = getPublicCopy(language);
  const postsSectionRef = useRef(null);
  const messagesSectionRef = useRef(null);
  const subscribeSectionRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchLayerRef = useRef(null);
  const searchTimerRef = useRef(0);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagePage, setMessagePage] = useState(1);
  const [messageTotalPages, setMessageTotalPages] = useState(1);
  const [messageTotalItems, setMessageTotalItems] = useState(0);
  const [sort, setSort] = useState("latest");
  const [postPageSize, setPostPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [messagePageSize, setMessagePageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formData, setFormData] = useState(initialForm);
  const [formStatus, setFormStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchRendered, setSearchRendered] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isMessagesView = initialSection === "messages";
  const isSubscribeView = initialSection === "subscribe";

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        const profileRequest = fetchProfile();
        const messageRequest = isMessagesView
          ? fetchMessages({ page: 1, pageSize: DEFAULT_PAGE_SIZE })
          : Promise.resolve({
              items: [],
              page: 1,
              totalPages: 1,
              totalItems: 0,
            });
        const postRequest =
          !isMessagesView && !isSubscribeView
            ? fetchPostPage({ page: 1, pageSize: DEFAULT_PAGE_SIZE, sort: "latest" })
            : Promise.resolve({
                items: [],
                page: 1,
                totalPages: 1,
                totalItems: 0,
              });

        const [profileData, messageData, postData] = await Promise.all([
          profileRequest,
          messageRequest,
          postRequest,
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setMessages(messageData.items);
        setMessagePage(messageData.page);
        setMessageTotalPages(messageData.totalPages);
        setMessageTotalItems(messageData.totalItems);
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
          sort,
          page: currentPage,
          pageSize: postPageSize,
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
  }, [copy.postLoadError, currentPage, loading, postPageSize, sort]);

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

  useEffect(() => {
    if (isSubscribeView) {
      requestAnimationFrame(() => {
        subscribeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [isSubscribeView]);

  const localizedProfile = localizeProfile(profile, language);
  const localizedPosts = posts.map((item) => localizePost(item, language));
  const localizedMessages = messages.map((item) => localizeMessage(item, language));
  const localizedSearchResults = searchResults.map((item) => localizePost(item, language));
  const subscribeActionHref =
    localizedProfile?.subscribeLinkUrl || `mailto:${localizedProfile?.email || "hello@bingstudio.dev"}`;
  const isMailSubscribe = subscribeActionHref.startsWith("mailto:");
  const subscribeActionLabel = isMailSubscribe
    ? copy.subscribeActionEmail
    : localizedProfile?.subscribeLinkLabel || copy.subscribeActionEmail;
  const hasPagination = totalItems > 0;
  const hasMessagePagination = messageTotalItems > 0;
  const heroMetaItems = isMessagesView
    ? [localizedProfile?.name, localizedProfile?.location, localizedProfile?.email].filter(Boolean)
    : isSubscribeView
      ? [copy.subscribeCurrentTitle, copy.subscribeRssTitle, subscribeActionLabel].filter(Boolean)
      : [
          copy.journalCountSummary(totalItems),
          sort === "popular"
            ? copy.journalSortPopular
            : sort === "starter"
              ? copy.journalSortStarter
              : copy.journalSortLatest,
        ].filter(Boolean);

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

  function navigateToArticle(slug) {
    window.location.hash = `#/journal/posts/${encodeURIComponent(slug)}`;
  }

  function openPostFromSearch(slug) {
    collapseSearch();
    navigateToArticle(slug);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus(copy.submitting);

    try {
      await createMessage(formData);
      const messageData = await fetchMessages({ page: 1, pageSize: messagePageSize });
      setMessages(messageData.items);
      setMessagePage(messageData.page);
      setMessageTotalPages(messageData.totalPages);
      setMessageTotalItems(messageData.totalItems);
      setFormData(initialForm);
      setFormStatus(copy.submitSuccess);
      setError("");
    } catch (requestError) {
      setFormStatus(copy.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadMessagesPage(nextPage, pageSize = messagePageSize) {
    try {
      setMessagesLoading(true);
      const data = await fetchMessages({ page: nextPage, pageSize });
      setMessages(data.items);
      setMessagePage(data.page);
      setMessageTotalPages(data.totalPages);
      setMessageTotalItems(data.totalItems);
      setError("");
    } catch (requestError) {
      setError(copy.initError);
    } finally {
      setMessagesLoading(false);
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
                  <h1>
                    {isMessagesView
                      ? localizedProfile?.messageTitle || copy.connectTitle
                      : isSubscribeView
                        ? copy.journalSubscribeTitle
                        : localizedProfile?.journalTitle || copy.journalTitle}
                  </h1>
                </div>
              </div>
            <p className="hero-bio">
              {isMessagesView
                ? localizedProfile?.messageDescription || copy.connectDescription
                : isSubscribeView
                  ? copy.journalSubscribeDescription
                  : localizedProfile?.journalDescription || copy.journalDescription}
            </p>
          </div>
          <div className="journal-hero-meta">
            {heroMetaItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        {!isMessagesView && !isSubscribeView ? (
          <section className="content-section" id="posts" ref={postsSectionRef}>
            <div className="discover-layout">
              <div className="discover-main discover-main-wide">
                <div className="panel control-deck">
                  <div className="control-deck-header control-deck-header-minimal">
                    <span className="filter-result-count">{copy.journalCountSummary(totalItems)}</span>
                  </div>

                  <div className="control-deck-body control-deck-body-open">
                    <div className="quick-tag-cloud journal-sort-row">
                      <span className="meta-label">{copy.journalSortLabel}</span>
                      {["latest", "popular", "starter"].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`pill tag-button ${sort === value ? "active-pill" : ""}`}
                          onClick={() =>
                            startTransition(() => {
                              setSort(value);
                              setCurrentPage(1);
                            })
                          }
                        >
                          {value === "popular"
                            ? copy.journalSortPopular
                            : value === "starter"
                              ? copy.journalSortStarter
                              : copy.journalSortLatest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {postsLoading ? <div className="empty-card">{copy.loadingPosts}</div> : null}
                {!postsLoading && !localizedPosts.length ? (
                  <div className="empty-card">{copy.emptyPosts}</div>
                ) : null}

                <div className="editorial-list">
                  {localizedPosts.map((post, index) => (
                    <article key={post.slug} className="panel editorial-card">
                      <div className="editorial-index">
                        {String((currentPage - 1) * postPageSize + index + 1).padStart(2, "0")}
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
                          onClick={() => navigateToArticle(post.slug)}
                        >
                          <h4>{post.title}</h4>
                        </button>
                        <p>{post.excerpt}</p>
                        {post.recommendedFor ? (
                          <p className="post-recommend-reason">
                            <strong>{copy.journalRecommendedLabel}</strong> {post.recommendedFor}
                          </p>
                        ) : null}
                        <div className="editorial-card-footer">
                          <div className="post-signal-row">
                            <span>{post.viewCount} {copy.statsViews}</span>
                            <span>{post.likeCount} {copy.statsLikes}</span>
                            <span>{post.commentCount} {copy.statsComments}</span>
                          </div>
                          <div className="editorial-card-footer-row">
                            <div className="chip-row editorial-tag-row">
                              {posts[index].starterRecommended ? (
                                <span className="pill soft">{copy.journalStarterBadge}</span>
                              ) : null}
                              {posts[index].tags.slice(0, 2).map((rawTag, tagIndex) => (
                                <span key={`${post.slug}-${rawTag}`} className="pill soft">
                                  #{post.tags[tagIndex] || rawTag}
                                </span>
                              ))}
                              {posts[index].tags.length > 2 ? (
                                <span className="pill soft">+{posts[index].tags.length - 2}</span>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              className="button secondary editorial-read-button"
                              onClick={() => navigateToArticle(post.slug)}
                            >
                              {copy.readArticle}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {hasPagination ? (
                  <div className="pagination-bar panel">
                    <div className="pagination-meta">
                      <label className="pagination-size-control">
                        <span>{copy.pageSizeLabel}</span>
                        <select
                          value={postPageSize}
                          onChange={(event) => {
                            const nextSize = Number(event.target.value) || DEFAULT_PAGE_SIZE;
                            setPostPageSize(nextSize);
                            setCurrentPage(1);
                          }}
                        >
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
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

        {isSubscribeView ? (
          <section className="content-section" id="subscribe" ref={subscribeSectionRef}>
            <SectionTitle
              eyebrow={copy.subscribePageEyebrow}
              title={copy.subscribePageTitle}
              description={copy.subscribePageDescription}
            />

            <div className="subscribe-guide-layout">
              <article className="panel subscribe-guide-card subscribe-guide-card-primary">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">{copy.subscribePageEyebrow}</span>
                    <h3>{copy.subscribeCurrentTitle}</h3>
                  </div>
                </div>
                <p>{localizedProfile?.subscribeDescription || copy.subscribeCurrentDescription}</p>
                <p>{copy.subscribeCurrentMeta}</p>
                <div className="subscribe-guide-actions">
                  <a className="button primary" href={subscribeActionHref}>
                    {subscribeActionLabel}
                  </a>
                  <a className="button secondary" href="#/journal/messages">
                    {copy.subscribeActionMessage}
                  </a>
                </div>
              </article>

              <article className="panel subscribe-guide-card">
                <span className="eyebrow">{copy.subscribeRssTitle}</span>
                <h3>{copy.subscribeRssTitle}</h3>
                <p>{copy.subscribeRssDescription}</p>
                <p>{copy.subscribeRssNote}</p>
              </article>

              <article className="panel subscribe-guide-card subscribe-guide-card-wide">
                <span className="eyebrow">{copy.subscribeFutureTitle}</span>
                <h3>{copy.subscribeFutureTitle}</h3>
                <p>{copy.subscribeFutureDescription}</p>
                <div className="subscribe-guide-actions">
                  <a className="button secondary" href="#/journal/posts">
                    {copy.subscribeActionBack}
                  </a>
                </div>
              </article>
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

              <div className="message-side-column">
                <div className="panel message-card conversation-card">
                  <div className="subheading">
                    <h3>{copy.latestMessages}</h3>
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
                  {hasMessagePagination ? (
                    <div className="pagination-bar">
                      <div className="pagination-meta">
                        <label className="pagination-size-control">
                          <span>{copy.pageSizeLabel}</span>
                          <select
                            value={messagePageSize}
                            onChange={(event) => {
                              const nextSize = Number(event.target.value) || DEFAULT_PAGE_SIZE;
                              setMessagePageSize(nextSize);
                              setMessagePage(1);
                              loadMessagesPage(1, nextSize);
                            }}
                          >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <button
                        className="button secondary"
                        type="button"
                        disabled={messagePage <= 1 || messagesLoading}
                        onClick={() => loadMessagesPage(Math.max(1, messagePage - 1))}
                      >
                        {copy.paginationPrevious}
                      </button>
                      <span className="pagination-label">
                        {copy.paginationLabel(messagePage, messageTotalPages)} · {messageTotalItems} {copy.messageCountLabel}
                      </span>
                      <button
                        className="button secondary"
                        type="button"
                        disabled={messagePage >= messageTotalPages || messagesLoading}
                        onClick={() => loadMessagesPage(Math.min(messageTotalPages, messagePage + 1))}
                      >
                        {copy.paginationNext}
                      </button>
                    </div>
                  ) : null}
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
    </div>
  );
}
