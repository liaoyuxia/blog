export default function PostModal({ post, onClose }) {
  if (!post) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <article className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button" aria-label="关闭">
          ×
        </button>
        <div className="modal-cover" style={{ background: post.cover }} />
        <div className="modal-content">
          <div className="meta-row">
            <span>{post.category}</span>
            <span>{post.publishedAt}</span>
            <span>{post.readingTime}</span>
          </div>
          <h3>{post.title}</h3>
          <div className="tag-row">
            {post.tags.map((tag) => (
              <span key={tag} className="pill soft">
                #{tag}
              </span>
            ))}
          </div>
          <div className="article-body">
            {post.content.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
