import { useEffect, useState } from "react";
import {
  createPostComment,
  fetchPostDetail,
  fetchPostComments,
  fetchProfile,
  likePost,
  recordPostView,
  unlikePost,
} from "./api/blog";
import BrandMark from "./components/BrandMark";
import ArticleBlocks from "./components/ArticleBlocks";
import { getPublicCopy, localizePost, localizeProfile } from "./i18n";
import { parseArticleContent } from "./utils/articleContent";

const LIKED_POSTS_STORAGE_KEY = "lin-blog-liked-posts";
const initialCommentForm = {
  name: "",
  email: "",
  content: "",
};
const DEFAULT_COMMENT_PAGE_SIZE = 10;
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

function navigateToArticle(slug) {
  window.location.hash = `#/journal/posts/${encodeURIComponent(slug)}`;
}

export default function ArticlePage({ language, onLanguageChange, slug }) {
  const copy = getPublicCopy(language);
  const [profile, setProfile] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoadingSlug, setDetailLoadingSlug] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsPageSize, setCommentsPageSize] = useState(DEFAULT_COMMENT_PAGE_SIZE);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsTotalItems, setCommentsTotalItems] = useState(0);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState(initialCommentForm);
  const [commentStatus, setCommentStatus] = useState("");
  const [error, setError] = useState("");
  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(LIKED_POSTS_STORAGE_KEY) || "[]");
    } catch (requestError) {
      return [];
    }
  });
  const [likePending, setLikePending] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(LIKED_POSTS_STORAGE_KEY, JSON.stringify(likedPosts));
  }, [likedPosts]);

  useEffect(() => {
    let mounted = true;

    async function loadArticle() {
      try {
        setLoading(true);
        setCommentStatus("");
        setCommentForm(initialCommentForm);
        const [profileData, detailData, commentsData] = await Promise.all([
          fetchProfile(),
          fetchPostDetail(slug),
          fetchPostComments(slug, { page: 1, pageSize: DEFAULT_COMMENT_PAGE_SIZE }),
        ]);

        if (!mounted) {
          return;
        }

        setProfile(profileData);
        setPost(detailData);
        setComments(commentsData.items);
        setCommentsPage(commentsData.page);
        setCommentsTotalPages(commentsData.totalPages);
        setCommentsTotalItems(commentsData.totalItems);
        setError("");
        window.scrollTo({ top: 0, behavior: "auto" });

        recordPostView(slug)
          .then((engagement) => {
            if (!mounted) {
              return;
            }

            setPost((current) =>
              current?.slug === slug ? { ...current, ...engagement } : current
            );
          })
          .catch(() => {});
      } catch (requestError) {
        if (mounted) {
          setError(copy.detailLoadError);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadArticle();
    return () => {
      mounted = false;
    };
  }, [copy.detailLoadError, slug]);

  useEffect(() => {
    if (!error) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setError(""), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [error]);

  const localizedProfile = localizeProfile(profile, language);
  const localizedPost = post ? localizePost(post, language) : null;
  const parsedArticle = parseArticleContent(localizedPost?.content || "", localizedPost?.slug || slug);
  const summaryLead = localizedPost?.recommendedFor || localizedPost?.excerpt;
  const subscribeTitle =
    localizedProfile?.subscribeTitle || copy.articleSubscribeFallbackTitle;
  const subscribeDescription =
    localizedProfile?.subscribeDescription || copy.articleSubscribeFallbackDescription;
  const subscribeLabel = localizedProfile?.subscribeLinkLabel || copy.subscribePrimaryCta;
  const liked = localizedPost ? likedPosts.includes(localizedPost.slug) : false;

  useEffect(() => {
    if (!localizedPost) {
      return;
    }

    document.title = `${localizedPost.title} · ${localizedProfile?.name || copy.brandTitle}`;
  }, [copy.brandTitle, localizedPost, localizedProfile?.name]);

  function jumpToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleToggleLike() {
    if (!localizedPost) {
      return;
    }

    try {
      setLikePending(true);
      const engagement = liked
        ? await unlikePost(localizedPost.slug)
        : await likePost(localizedPost.slug);

      setPost((current) =>
        current?.slug === localizedPost.slug ? { ...current, ...engagement } : current
      );
      setLikedPosts((current) =>
        liked
          ? current.filter((item) => item !== localizedPost.slug)
          : Array.from(new Set([...current, localizedPost.slug]))
      );
      setError(liked ? copy.articleUnliked : copy.articleLiked);
    } catch (requestError) {
      setError(requestError.message || copy.detailLoadError);
    } finally {
      setLikePending(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!localizedPost) {
      return;
    }

    try {
      setCommentSubmitting(true);
      await createPostComment(localizedPost.slug, commentForm);
      const commentsData = await fetchPostComments(localizedPost.slug, {
        page: 1,
        pageSize: commentsPageSize,
      });
      setComments(commentsData.items);
      setCommentsPage(commentsData.page);
      setCommentsTotalPages(commentsData.totalPages);
      setCommentsTotalItems(commentsData.totalItems);
      setPost((current) =>
        current?.slug === localizedPost.slug
          ? {
              ...current,
              commentCount: commentsData.totalItems,
            }
          : current
      );
      setCommentForm(initialCommentForm);
      setCommentStatus(copy.commentSubmitSuccess);
    } catch (requestError) {
      setCommentStatus(requestError.message || copy.commentSubmitError);
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function loadCommentsPage(nextPage, pageSize = commentsPageSize) {
    if (!localizedPost) {
      return;
    }

    try {
      setCommentsLoading(true);
      const data = await fetchPostComments(localizedPost.slug, {
        page: nextPage,
        pageSize,
      });
      setComments(data.items);
      setCommentsPage(data.page);
      setCommentsTotalPages(data.totalPages);
      setCommentsTotalItems(data.totalItems);
      setError("");
    } catch (requestError) {
      setError(requestError.message || copy.detailLoadError);
    } finally {
      setCommentsLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">{copy.pageLoading}</div>;
  }

  if (!localizedPost) {
    return (
      <div className="page-shell journal-page article-page">
        <div className="empty-card article-empty-state">{copy.detailLoadError}</div>
      </div>
    );
  }

  return (
    <div className="page-shell journal-page article-page">
      <header className="topbar journal-topbar">
        <div className="journal-topbar-main">
          <div className="brand">
            <BrandMark avatarUrl={localizedProfile?.avatarUrl} name={localizedProfile?.name} />
            <div>
              <span className="eyebrow">{copy.journalEyebrow}</span>
              <strong>{localizedProfile?.name || copy.brandTitle}</strong>
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
            </div>
          </div>
        </div>
      </header>

      <main className="article-page-main">
        <article className="panel article-page-shell">
          <div className="article-page-header">
            <div className="article-page-header-copy">
              <div className="meta-row article-page-breadcrumbs">
                <a href="#/journal/posts">{copy.navPosts}</a>
                <span>/</span>
                <span>{localizedPost.category}</span>
                <span>/</span>
                <span>{localizedPost.publishedAt}</span>
              </div>
              <h1>{localizedPost.title}</h1>
              <p className="article-page-excerpt">{localizedPost.excerpt}</p>
            </div>

            <div className="article-page-header-side">
              <div className="meta-row">
                <span>{localizedPost.readingTime}</span>
                <span>{localizedPost.viewCount} {copy.statsViews}</span>
                <span>{localizedPost.commentCount} {copy.statsComments}</span>
              </div>
              <div className="tag-row">
                {localizedPost.tags.map((tag) => (
                  <span key={tag} className="pill soft">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="article-page-toolbar">
            <div className="post-engagement-stats">
              <span>{localizedPost.viewCount} {copy.statsViews}</span>
              <span>{localizedPost.likeCount} {copy.statsLikes}</span>
              <span>{localizedPost.commentCount} {copy.statsComments}</span>
            </div>
            <div className="article-page-toolbar-actions">
              <a className="button secondary" href="#/journal/posts">
                {copy.onboardingMore}
              </a>
              <button
                className={`button secondary like-action ${liked ? "is-liked" : "is-idle"}`}
                type="button"
                disabled={likePending}
                onClick={handleToggleLike}
              >
                {liked ? copy.unlikeAction : copy.likeAction}
              </button>
            </div>
          </div>

          <ArticleBlocks
            blocks={parsedArticle.blocks}
            outline={parsedArticle.outline}
            outlineEyebrow={copy.articleOutlineEyebrow}
            outlineTitle={copy.articleOutlineTitle}
            outlineDescription={copy.articleOutlineDescription}
            onJumpToSection={jumpToSection}
            emptyText={copy.postLoadError}
          />

          <section className="article-summary-card">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">{copy.articleSummaryEyebrow}</span>
                <h3>{copy.articleSummaryTitle}</h3>
              </div>
            </div>
            <p>{summaryLead}</p>
            <p>{copy.articleSummaryNextStep}</p>
          </section>

          {localizedPost.relatedPosts?.length ? (
            <section className="article-continue-section">
              <div className="section-heading compact">
                <div>
                  <h3>{copy.articleContinueTitle}</h3>
                </div>
              </div>

              <div className="article-related-grid">
                {localizedPost.relatedPosts.map((item) => (
                  <article key={item.slug} className="article-related-card">
                    <span className="eyebrow">{copy.articleRelatedLabel}</span>
                    <button
                      type="button"
                      className="article-related-button"
                      disabled={detailLoadingSlug === item.slug}
                      onClick={() => {
                        setDetailLoadingSlug(item.slug);
                        navigateToArticle(item.slug);
                      }}
                    >
                      <h4>{item.title}</h4>
                    </button>
                    <p>{item.recommendedFor || item.excerpt}</p>
                    <div className="meta-row">
                      <span>{item.category}</span>
                      <span>{item.readingTime}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {localizedPost.prevPost || localizedPost.nextPost ? (
            <section className="article-neighbor-grid">
              {[["prev", localizedPost.prevPost], ["next", localizedPost.nextPost]].map(
                ([direction, item]) =>
                  item ? (
                    <article
                      key={item.slug}
                      className={`article-neighbor-card ${direction === "prev" ? "is-prev" : "is-next"}`}
                    >
                      <span className="eyebrow">
                        {direction === "prev" ? copy.articlePrevLabel : copy.articleNextLabel}
                      </span>
                      <button
                        type="button"
                        className="article-neighbor-button"
                        disabled={detailLoadingSlug === item.slug}
                        onClick={() => {
                          setDetailLoadingSlug(item.slug);
                          navigateToArticle(item.slug);
                        }}
                      >
                        <h4>{item.title}</h4>
                      </button>
                      <p>{item.excerpt}</p>
                    </article>
                  ) : (
                    <div key={direction} />
                  )
              )}
            </section>
          ) : null}

          <section className="article-subscribe-card">
            <div>
              <span className="eyebrow">{copy.articleSubscribeEyebrow}</span>
              <h3>{subscribeTitle}</h3>
              <p>{subscribeDescription}</p>
            </div>
            <div className="article-subscribe-actions">
              <a className="button primary" href="#/journal/subscribe">
                {subscribeLabel}
              </a>
              <a className="button secondary" href="#/journal/posts">
                {copy.onboardingMore}
              </a>
            </div>
          </section>

          <section className="post-feedback-section">
            <div className="subheading">
              <h3>{copy.articleFeedbackTitle}</h3>
            </div>

            <form className="post-comment-form" onSubmit={handleCommentSubmit}>
              <div className="post-comment-grid">
                <label>
                  <span>{copy.commentName}</span>
                  <input
                    value={commentForm.name}
                    onChange={(event) =>
                      setCommentForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder={copy.formNamePlaceholder}
                    required
                  />
                </label>
                <label>
                  <span>{copy.commentEmail}</span>
                  <input
                    type="email"
                    value={commentForm.email}
                    onChange={(event) =>
                      setCommentForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="your@email.com"
                    required
                  />
                </label>
              </div>
              <label>
                <span>{copy.commentContent}</span>
                <textarea
                  rows="4"
                  value={commentForm.content}
                  onChange={(event) =>
                    setCommentForm((current) => ({ ...current, content: event.target.value }))
                  }
                  placeholder={copy.formContentPlaceholder}
                  required
                />
              </label>
              <button className="button primary" type="submit" disabled={commentSubmitting}>
                {commentSubmitting ? copy.submitting : copy.commentSubmit}
              </button>
              {commentStatus ? (
                <p className="form-status" aria-live="polite">
                  {commentStatus}
                </p>
              ) : null}
            </form>

            <div className="post-comment-list">
              {comments.length ? (
                comments.map((comment) => (
                  <article key={comment.id} className="post-comment-item">
                    <div className="post-comment-head">
                      <strong>{comment.name}</strong>
                      <span>{comment.createdAt}</span>
                    </div>
                    <p>{comment.content}</p>
                  </article>
                ))
              ) : (
                <div className="empty-card">{copy.emptyComments}</div>
              )}
            </div>
            {commentsTotalItems > 0 ? (
              <div className="pagination-bar">
                <div className="pagination-meta">
                  <label className="pagination-size-control">
                    <span>{copy.pageSizeLabel}</span>
                    <select
                      value={commentsPageSize}
                      onChange={(event) => {
                        const nextSize = Number(event.target.value) || DEFAULT_COMMENT_PAGE_SIZE;
                        setCommentsPageSize(nextSize);
                        setCommentsPage(1);
                        loadCommentsPage(1, nextSize);
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
                  disabled={commentsPage <= 1 || commentsLoading}
                  onClick={() => loadCommentsPage(Math.max(1, commentsPage - 1))}
                >
                  {copy.paginationPrevious}
                </button>
                <span className="pagination-label">
                  {copy.paginationLabel(commentsPage, commentsTotalPages)} · {commentsTotalItems} {copy.statsComments}
                </span>
                <button
                  className="button secondary"
                  type="button"
                  disabled={commentsPage >= commentsTotalPages || commentsLoading}
                  onClick={() => loadCommentsPage(Math.min(commentsTotalPages, commentsPage + 1))}
                >
                  {copy.paginationNext}
                </button>
              </div>
            ) : null}
          </section>
        </article>
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
