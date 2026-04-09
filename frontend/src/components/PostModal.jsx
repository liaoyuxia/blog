import { useEffect, useState } from "react";
import { parseArticleContent } from "../utils/articleContent";

const initialCommentForm = {
  name: "",
  email: "",
  content: "",
};

export default function PostModal({
  post,
  profile,
  onClose,
  onOpenPost,
  closeLabel,
  copy,
  liked,
  likePending,
  detailLoadingSlug,
  commentSubmitting,
  onToggleLike,
  onSubmitComment,
}) {
  const [commentForm, setCommentForm] = useState(initialCommentForm);
  const [commentStatus, setCommentStatus] = useState("");

  useEffect(() => {
    if (!post) {
      return undefined;
    }

    const { overflow } = document.body.style;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    document.body.classList.add("reading-active");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.body.classList.remove("reading-active");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, post]);

  useEffect(() => {
    setCommentForm(initialCommentForm);
    setCommentStatus("");
  }, [post?.slug]);

  if (!post) {
    return null;
  }

  const subscribeHref = "#/journal/subscribe";
  const subscribeTitle = profile?.subscribeTitle || copy.articleSubscribeFallbackTitle;
  const subscribeDescription =
    profile?.subscribeDescription || copy.articleSubscribeFallbackDescription;
  const subscribeLabel = profile?.subscribeLinkLabel || copy.subscribePrimaryCta;
  const summaryLead = post.recommendedFor || post.excerpt;
  const { blocks, outline } = parseArticleContent(post.content || "", post.slug);
  const hasOutline = outline.length >= 2;

  function navigateWithinSite(path) {
    onClose();
    window.location.hash = path.replace(/^#/, "");
  }

  function jumpToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    try {
      await onSubmitComment(post.slug, commentForm);
      setCommentForm(initialCommentForm);
      setCommentStatus(copy.commentSubmitSuccess);
    } catch (error) {
      setCommentStatus(error.message || copy.commentSubmitError);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-floating-bar">
          <button className="modal-close" onClick={onClose} type="button" aria-label={closeLabel}>
            ×
          </button>
        </div>
        <div className="modal-cover" style={{ background: post.cover }} />
        <div className="modal-content">
          <div className="meta-row">
            <span>{post.category}</span>
            <span>{post.publishedAt}</span>
            <span>{post.readingTime}</span>
          </div>
          <h3 id="post-modal-title">{post.title}</h3>
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span key={tag} className="pill soft">
                #{tag}
              </span>
            ))}
          </div>

          <div className="post-engagement-bar">
            <div className="post-engagement-stats">
              <span>{post.viewCount} {copy.statsViews}</span>
              <span>{post.likeCount} {copy.statsLikes}</span>
              <span>{post.commentCount} {copy.statsComments}</span>
            </div>
            <button
              className={`button secondary like-action ${liked ? "is-liked" : ""}`}
              type="button"
              disabled={likePending}
              onClick={() => onToggleLike(post.slug, liked)}
            >
              {liked ? copy.unlikeAction : copy.likeAction}
            </button>
          </div>

          <div className={`article-reading-layout ${hasOutline ? "has-outline" : ""}`}>
            <div className="article-body">
              {blocks.map((block, index) => {
                if (block.type === "heading") {
                  const HeadingTag =
                    block.level === 1 ? "h4" : block.level === 2 ? "h5" : "h6";
                  return (
                    <HeadingTag
                      key={block.id}
                      id={block.id}
                      className={`article-body-heading article-body-heading-level-${block.level}`}
                    >
                      {block.text}
                    </HeadingTag>
                  );
                }

                if (block.type === "list") {
                  return (
                    <ul key={`${post.slug}-list-${index}`} className="article-body-list">
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                }

                return <p key={`${post.slug}-paragraph-${index}`}>{block.text}</p>;
              })}
            </div>

            {hasOutline ? (
              <aside className="article-outline-card">
                <span className="eyebrow">{copy.articleOutlineEyebrow}</span>
                <h4>{copy.articleOutlineTitle}</h4>
                <p>{copy.articleOutlineDescription}</p>
                <div className="article-outline-list">
                  {outline.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`article-outline-link level-${item.level}`}
                      onClick={() => jumpToSection(item.id)}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>

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

          {post.relatedPosts?.length ? (
            <section className="article-continue-section">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">{copy.articleContinueTitle}</span>
                  <h3>{copy.articleContinueTitle}</h3>
                </div>
                <p>{copy.articleContinueDescription}</p>
              </div>

              <div className="article-related-grid">
                {post.relatedPosts.map((item) => (
                  <article key={item.slug} className="article-related-card">
                    <span className="eyebrow">{copy.articleRelatedLabel}</span>
                    <button
                      type="button"
                      className="article-related-button"
                      disabled={detailLoadingSlug === item.slug}
                      onClick={() => onOpenPost(item.slug)}
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

          {post.prevPost || post.nextPost ? (
            <section className="article-neighbor-grid">
              {[["prev", post.prevPost], ["next", post.nextPost]].map(([direction, item]) =>
                item ? (
                  <article key={item.slug} className="article-neighbor-card">
                    <span className="eyebrow">
                      {direction === "prev" ? copy.articlePrevLabel : copy.articleNextLabel}
                    </span>
                    <button
                      type="button"
                      className="article-related-button"
                      disabled={detailLoadingSlug === item.slug}
                      onClick={() => onOpenPost(item.slug)}
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
              <button
                className="button primary"
                type="button"
                onClick={() => navigateWithinSite(subscribeHref)}
              >
                {subscribeLabel}
              </button>
              <button
                className="button secondary"
                type="button"
                onClick={() => navigateWithinSite("#/journal/posts")}
              >
                {copy.onboardingMore}
              </button>
            </div>
          </section>

          <section className="post-feedback-section">
            <div className="subheading">
              <h3>{copy.articleFeedbackTitle}</h3>
              <span>{copy.articleFeedbackDescription}</span>
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
              {post.comments?.length ? (
                post.comments.map((comment) => (
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
          </section>
        </div>
      </article>
    </div>
  );
}
