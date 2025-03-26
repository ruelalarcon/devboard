const sanitizeHtml = require("sanitize-html");

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows limited set of tags and attributes that are safe for markdown-style formatting
 *
 * @param {string} content - The HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
function sanitizeContent(content) {
  if (!content) return "";

  // Handle blockquotes in Markdown format (lines starting with '> ')
  // We need to do this before sanitizing HTML
  let processedContent = content;
  const blockquoteRegex = /^>\s+(.+)$/gm;

  // Replace Markdown blockquotes with HTML blockquotes
  processedContent = processedContent.replace(blockquoteRegex, '<blockquote>$1</blockquote>');

  // Then sanitize the HTML
  return sanitizeHtml(processedContent, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "p",
      "a",
      "ul",
      "ol",
      "li",
      "strong",
      "b",
      "em",
      "code",
      "pre",
      "br",
      "del",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      code: ["class"],
      pre: ["class"],
    },
    // Don't allow classes except on code/pre tags (for syntax highlighting)
    allowedClasses: {
      code: [/^language-\w+$/],
      pre: [/^language-\w+$/],
    },
    // Always set the target and rel attributes for links
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer",
            // Only allow http, https, and ftp protocols
            href:
              attribs.href && /^(https?|ftp):\/\//i.test(attribs.href)
                ? attribs.href
                : "#",
          },
        };
      },
    },
  });
}

module.exports = {
  sanitizeContent,
};
