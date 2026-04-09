export function parseArticleContent(content, slug) {
  const blocks = [];
  const outline = [];
  let paragraphLines = [];
  let listItems = [];
  let headingIndex = 0;
  let imageIndex = 0;

  const pushHeading = (text, level) => {
    const id = `${slug}-section-${headingIndex}`;
    headingIndex += 1;

    blocks.push({
      type: "heading",
      text,
      level,
      id,
    });
    outline.push({ id, text, level });
  };

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ").trim(),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    blocks.push({
      type: "list",
      items: [...listItems],
    });
    listItems = [];
  };

  const pushImage = (alt, src) => {
    blocks.push({
      type: "image",
      id: `${slug}-image-${imageIndex}`,
      alt,
      src,
    });
    imageIndex += 1;
  };

  content.split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const wrappedHeadingWithBodyMatch = trimmed.match(/^(#{1,3})\s*(.+?)\s*\1\s+(.+)$/);
    if (wrappedHeadingWithBodyMatch) {
      flushParagraph();
      flushList();

      pushHeading(wrappedHeadingWithBodyMatch[2].trim(), wrappedHeadingWithBodyMatch[1].length);
      paragraphLines.push(wrappedHeadingWithBodyMatch[3].trim());
      return;
    }

    const wrappedHeadingMatch = trimmed.match(/^(#{1,3})\s*(.+?)\s*\1\s*$/);
    if (wrappedHeadingMatch) {
      flushParagraph();
      flushList();

      pushHeading(wrappedHeadingMatch[2].trim(), wrappedHeadingMatch[1].length);
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s*(.+)$/);
    if (headingMatch) {
      const normalizedText = headingMatch[2].replace(/\s+#+\s*$/, "").trim();

      if (!normalizedText) {
        paragraphLines.push(trimmed);
        return;
      }

      flushParagraph();
      flushList();

      pushHeading(normalizedText, headingMatch[1].length);
      return;
    }

    const listMatch = trimmed.match(/^([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[2].trim());
      return;
    }

    if (listItems.length) {
      flushList();
    }

    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.+?)\)$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      pushImage(imageMatch[1].trim(), imageMatch[2].trim());
      return;
    }

    paragraphLines.push(trimmed);
  });

  flushParagraph();
  flushList();

  return { blocks, outline };
}
