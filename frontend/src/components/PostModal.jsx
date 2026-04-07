import { useEffect, useState } from "react";

const initialCommentForm = {
  name: "",
  email: "",
  content: "",
};

export default function PostModal({
  post,
  onClose,
  closeLabel,
  copy,
  liked,
  likePending,
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

          <div className="article-body">
            {post.content.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

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
