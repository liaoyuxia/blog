export default function ArticleBlocks({
  blocks,
  outline = [],
  showOutline = outline.length >= 2,
  outlineEyebrow,
  outlineTitle,
  onJumpToSection,
  emptyText,
}) {
  return (
    <div className={`article-reading-layout ${showOutline ? "has-outline" : ""}`}>
      <div className="article-body">
        {blocks.length ? (
          blocks.map((block, index) => {
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
                <ul key={`article-list-${index}`} className="article-body-list">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            if (block.type === "image") {
              return (
                <figure key={block.id} className="article-body-image">
                  <img src={block.src} alt={block.alt || ""} loading="lazy" />
                  {block.alt ? <figcaption>{block.alt}</figcaption> : null}
                </figure>
              );
            }

            return <p key={`article-paragraph-${index}`}>{block.text}</p>;
          })
        ) : (
          <p>{emptyText}</p>
        )}
      </div>

      {showOutline ? (
        <aside className="article-outline-card">
          <span className="eyebrow">{outlineEyebrow}</span>
          <h4>{outlineTitle}</h4>
          <div className="article-outline-list">
            {outline.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`article-outline-link level-${item.level}`}
                onClick={() => onJumpToSection?.(item.id)}
              >
                {item.text}
              </button>
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
