import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  fetchPosts,
  fetchProfile,
  fetchStats,
  recordVisit,
} from "./api/blog";
import SectionTitle from "./components/SectionTitle";
import { getPublicCopy, localizePost, localizeProfile } from "./i18n";

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

function compactHeroDescription(text, language) {
  if (!text) {
    return text;
  }

  if (language === "en") {
    const [lead] = text.split(/\s+so\s+/i);
    return lead?.trim().replace(/[.,;:\s]+$/, "") + "." || text;
  }

  const normalized = text
    .replace(/，帮助.*$/, "")
    .replace(/，让你.*$/, "")
    .replace(/，方便.*$/, "");

  return normalized.endsWith("。") ? normalized : `${normalized}。`;
}

export default function BlogHome({ language, onLanguageChange }) {
  const copy = getPublicCopy(language);
  const pageShellRef = useRef(null);
  const heroVisualRef = useRef(null);
  const catHeadRef = useRef(null);
  const catGreetingTimerRef = useRef(0);
  const searchInputRef = useRef(null);
  const searchLayerRef = useRef(null);
  const searchTimerRef = useRef(0);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchRendered, setSearchRendered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [catGreetingVisible, setCatGreetingVisible] = useState(false);
  const [error, setError] = useState("");

  function applyPageMotion(clientX, clientY) {
    if (!pageShellRef.current || !catHeadRef.current) {
      return;
    }

    const shellRect = pageShellRef.current.getBoundingClientRect();
    const sceneRect = heroVisualRef.current?.getBoundingClientRect() || shellRect;
    const headRect = catHeadRef.current.getBoundingClientRect();
    const headCenterX = headRect.left + headRect.width / 2;
    const headCenterY = headRect.top + headRect.height / 2;
    const offsetX = clientX - headCenterX;
    const offsetY = clientY - headCenterY;
    const normalizedX = offsetX / Math.max(sceneRect.width * 0.28, 1);
    const normalizedY = offsetY / Math.max(sceneRect.height * 0.24, 1);
    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));
    const deadZone = 0.16;
    const easedX =
      Math.abs(clampedX) < deadZone
        ? 0
        : Math.sign(clampedX) * ((Math.abs(clampedX) - deadZone) / (1 - deadZone));
    const easedY =
      Math.abs(clampedY) < deadZone
        ? 0
        : Math.sign(clampedY) * ((Math.abs(clampedY) - deadZone) / (1 - deadZone));

    pageShellRef.current.style.setProperty("--cursor-x", `${((easedX + 1) / 2) * 100}%`);
    pageShellRef.current.style.setProperty("--cursor-y", `${((easedY + 1) / 2) * 100}%`);
    pageShellRef.current.style.setProperty("--pet-look-x", `${easedX * 9}px`);
    pageShellRef.current.style.setProperty("--pet-look-y", `${easedY * -6}px`);
    pageShellRef.current.style.setProperty("--pet-tilt", `${easedX * 11}deg`);
    pageShellRef.current.style.setProperty("--pet-lift", `${easedY * 5}px`);
  }

  function resetPageMotion() {
    if (!pageShellRef.current) {
      return;
    }

    pageShellRef.current.style.setProperty("--cursor-x", "50%");
    pageShellRef.current.style.setProperty("--cursor-y", "50%");
    pageShellRef.current.style.setProperty("--pet-look-x", "0px");
    pageShellRef.current.style.setProperty("--pet-look-y", "0px");
    pageShellRef.current.style.setProperty("--pet-tilt", "0deg");
    pageShellRef.current.style.setProperty("--pet-lift", "0px");
  }

  const deferredKeyword = useDeferredValue(searchQuery.trim());

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setLoading(true);
        const [profileData, statsData, recommendedData] =
          await Promise.all([
          fetchProfile(),
          fetchStats(),
          fetchPosts({ sort: "featured", limit: 8 }),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setStats(statsData);
        setRecommendedPosts(recommendedData);
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
  }, [copy.initError]);

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
    if (!pageShellRef.current) {
      return undefined;
    }

    resetPageMotion();

    function handlePointerMove(event) {
      applyPageMotion(event.clientX, event.clientY);
    }

    function handleMouseMove(event) {
      applyPageMotion(event.clientX, event.clientY);
    }

    function handleTouchMove(event) {
      const touch = event.touches?.[0];

      if (touch) {
        applyPageMotion(touch.clientX, touch.clientY);
      }
    }

    pageShellRef.current.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseleave", resetPageMotion);
    window.addEventListener("blur", resetPageMotion);

    return () => {
      pageShellRef.current?.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseleave", resetPageMotion);
      window.removeEventListener("blur", resetPageMotion);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(searchTimerRef.current), []);

  useEffect(() => () => window.clearTimeout(catGreetingTimerRef.current), []);

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

      if (searchRendered || searchQuery) {
        collapseSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchRendered, searchQuery]);

  const localizedProfile = localizeProfile(profile, language);
  const localizedRecommendedPosts = recommendedPosts.map((item) => localizePost(item, language));
  const localizedSearchResults = searchResults.map((item) => localizePost(item, language));
  const subscribeHref = "#/journal/subscribe";
  const catGreeting = language === "en" ? "Hi there~" : "你好呀～";
  const heroDescription = compactHeroDescription(
    localizedProfile?.heroDescription || localizedProfile?.bio,
    language
  );
  const pinnedHomepagePost = localizedRecommendedPosts.find((post) => post.featured);
  const explicitlySelectedHomepagePosts = localizedRecommendedPosts.filter(
    (post) => post.homepageSelected && (!pinnedHomepagePost || post.slug !== pinnedHomepagePost.slug)
  );
  const fallbackHomepagePosts = localizedRecommendedPosts.filter(
    (post) =>
      (!pinnedHomepagePost || post.slug !== pinnedHomepagePost.slug) &&
      !post.homepageSelected
  );
  const homepageVisiblePosts = [
    ...(pinnedHomepagePost ? [pinnedHomepagePost] : []),
    ...explicitlySelectedHomepagePosts,
    ...fallbackHomepagePosts,
  ].slice(0, 3);
  const [leadFeaturePost, ...secondaryFeaturePosts] = homepageVisiblePosts;

  function navigateToArticle(slug) {
    window.location.hash = `#/journal/posts/${encodeURIComponent(slug)}`;
  }

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

  function handleCatGreeting() {
    window.clearTimeout(catGreetingTimerRef.current);
    setCatGreetingVisible(true);
    catGreetingTimerRef.current = window.setTimeout(() => {
      setCatGreetingVisible(false);
    }, 1800);
  }

  function openPostFromSearch(slug) {
    collapseSearch();
    navigateToArticle(slug);
  }

  if (loading) {
    return <div className="loading-screen">{copy.pageLoading}</div>;
  }

  return (
    <div
      ref={pageShellRef}
      className="page-shell atelier-home"
      onMouseLeave={resetPageMotion}
      onMouseMove={(event) => applyPageMotion(event.clientX, event.clientY)}
      onPointerLeave={resetPageMotion}
      onPointerMove={(event) => applyPageMotion(event.clientX, event.clientY)}
    >
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
          <div
            className={`atelier-topbar-search-stack ${searchExpanded ? "is-active" : "is-idle"}`}
            ref={searchLayerRef}
          >
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

      <main className="atelier-main">
        <section className="atelier-stage redesign-stage">
          <article className="panel atelier-manifesto redesign-hero-card">
            <div className="home-hero-grid">
              <div className="home-hero-main">
                <div className="home-hero-main-copy">
                  <p className="eyebrow">{localizedProfile?.heroEyebrow || copy.heroEyebrow}</p>
                  <div className="hero-identity">
                    <div className="hero-identity-copy">
                      <h1>{localizedProfile?.heroTitle || localizedProfile?.name}</h1>
                      <p className="atelier-role">{localizedProfile?.role}</p>
                    </div>
                  </div>
                  <p className="hero-bio">{heroDescription}</p>
                </div>

                <div className="home-hero-main-footer">
                  <div className="atelier-inline-metrics home-hero-metrics">
                    <article>
                      <strong>{stats?.postCount ?? 0}</strong>
                      <span>{copy.statsPosts}</span>
                    </article>
                    <article>
                      <strong>{stats?.categoryCount ?? 0}</strong>
                      <span>{copy.statsCategories}</span>
                    </article>
                    <article>
                      <strong>{stats?.visitCount ?? 0}</strong>
                      <span>{copy.statsVisits}</span>
                    </article>
                  </div>
                </div>
              </div>

              <aside className="home-hero-rail">
                <article ref={heroVisualRef} className="home-hero-visual-card">
                  <div className="home-hero-pet-scene">
                    <span className="home-hero-scene-star home-hero-scene-star-1" />
                    <span className="home-hero-scene-star home-hero-scene-star-2" />
                    <span className="home-hero-scene-star home-hero-scene-star-3" />
                    <span className="home-hero-scene-star home-hero-scene-star-4" />
                    <span className="home-hero-scene-star home-hero-scene-star-5" />
                    <span className="home-hero-scene-glow" />
                    <div className="home-hero-cat">
                      <span className="home-hero-cat-tail" />
                      <span className="home-hero-cat-body" />
                      <span className="home-hero-cat-chest" />
                      <span className="home-hero-cat-paw home-hero-cat-paw-left" />
                      <span className="home-hero-cat-paw home-hero-cat-paw-right" />
                      <div
                        ref={catHeadRef}
                        className="home-hero-cat-head"
                        role="button"
                        tabIndex={0}
                        aria-label={catGreeting}
                        onClick={handleCatGreeting}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleCatGreeting();
                          }
                        }}
                      >
                        {catGreetingVisible ? (
                          <span className="home-hero-cat-bubble">{catGreeting}</span>
                        ) : null}
                        <span className="home-hero-cat-ear home-hero-cat-ear-left" />
                        <span className="home-hero-cat-ear home-hero-cat-ear-right" />
                        <span className="home-hero-cat-face" />
                        <span className="home-hero-cat-eye home-hero-cat-eye-left">
                          <span className="home-hero-cat-pupil" />
                        </span>
                        <span className="home-hero-cat-eye home-hero-cat-eye-right">
                          <span className="home-hero-cat-pupil" />
                        </span>
                        <span className="home-hero-cat-nose" />
                        <span className="home-hero-cat-mouth" />
                        <span className="home-hero-cat-whiskers home-hero-cat-whiskers-left" />
                        <span className="home-hero-cat-whiskers home-hero-cat-whiskers-right" />
                      </div>
                    </div>
                    <div className="home-hero-ground" />
                  </div>
                </article>
              </aside>
            </div>
          </article>
        </section>

        <section className="content-section redesign-home-section" id="featured">
          <div className="home-browse-heading">
            <SectionTitle title={copy.exploreTitle} description={copy.exploreDescription} />
            <div className="home-browse-heading-actions">
              <a className="button secondary" href="#/journal/posts">
                {copy.heroSecondaryCta}
              </a>
            </div>
          </div>

          {leadFeaturePost ? (
            <div className="home-featured-layout">
              <div className="home-featured-primary">
                <article className="panel home-featured-lead">
                  <div className="home-featured-lead-layout">
                    <div className="home-featured-lead-copy">
                      <div className="atelier-story-headline">
                        <span className="eyebrow">{copy.featuredCaption}</span>
                        <span>{leadFeaturePost.publishedAt}</span>
                      </div>
                      <button
                        type="button"
                        className="atelier-story-button"
                        onClick={() => navigateToArticle(leadFeaturePost.slug)}
                      >
                        <h3>{leadFeaturePost.title}</h3>
                      </button>
                      <p>{leadFeaturePost.excerpt}</p>
                    </div>

                    <aside className="home-featured-meta-panel">
                      {leadFeaturePost.recommendedFor ? (
                        <div className="home-featured-meta-block">
                          <span className="eyebrow">{copy.journalRecommendedLabel}</span>
                          <p>{leadFeaturePost.recommendedFor}</p>
                        </div>
                      ) : null}
                      <div className="home-featured-meta-block">
                        <span className="eyebrow">{copy.homeJourneyTitle}</span>
                        <div className="post-signal-row home-featured-signal-row">
                          <span>{leadFeaturePost.viewCount} {copy.statsViews}</span>
                          <span>{leadFeaturePost.likeCount} {copy.statsLikes}</span>
                          <span>{leadFeaturePost.commentCount} {copy.statsComments}</span>
                        </div>
                      </div>
                      <div className="chip-row home-featured-tag-row">
                        {leadFeaturePost.starterRecommended ? (
                          <span className="pill soft">{copy.journalStarterBadge}</span>
                        ) : null}
                        {leadFeaturePost.tags.slice(0, 2).map((tag) => (
                          <span key={`${leadFeaturePost.slug}-${tag}`} className="pill soft">
                            #{tag}
                          </span>
                        ))}
                        {leadFeaturePost.tags.length > 2 ? (
                          <span className="pill soft">+{leadFeaturePost.tags.length - 2}</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="button secondary home-featured-read-button"
                        onClick={() => navigateToArticle(leadFeaturePost.slug)}
                      >
                        {copy.readArticle}
                      </button>
                    </aside>
                  </div>
                </article>

              </div>

              <div className="home-featured-stack">
                {secondaryFeaturePosts.map((post) => (
                  <article key={post.slug} className="panel redesign-onboarding-card home-featured-support">
                    <div className="meta-row">
                      <span>{post.category}</span>
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
                      <div className="inline-recommend-chip">
                        <span>{post.recommendedFor}</span>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

        </section>

        <section className="content-section redesign-home-final" id="subscribe">
          <article className="panel atelier-about-card redesign-home-cta">
            <div className="redesign-home-cta-copy">
              <span className="eyebrow">{copy.heroSubscribeCta}</span>
              <h3>{localizedProfile?.subscribeTitle}</h3>
              <p>{localizedProfile?.subscribeDescription}</p>
            </div>
            <div className="hero-actions redesign-hero-actions redesign-home-cta-actions">
              <a className="button primary" href={subscribeHref}>
                {copy.subscribePrimaryCta}
              </a>
              <a className="button secondary" href="#/journal/posts">
                {copy.browsePosts}
              </a>
            </div>
          </article>
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

    </div>
  );
}
