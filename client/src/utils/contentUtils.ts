interface ContentBlock {
  type: 'text' | 'code' | 'blockquote' | 'header' | 'list';
  content: string;
  language?: string;
  level?: number; // For header levels
  items?: string[]; // For list items
}

export function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  // Match code blocks first
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block if any
    if (match.index > lastIndex) {
      const textBeforeCode = content.slice(lastIndex, match.index);
      parseTextBlocks(textBeforeCode, blocks);
    }

    // Add code block
    blocks.push({
      type: 'code',
      content: match[2], // The code content
      language: match[1] || 'plaintext', // The language specified after ``` or default to plaintext
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block if any
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    parseTextBlocks(remainingText, blocks);
  }

  return blocks;
}

// Helper function to parse text blocks for other markdown elements
function parseTextBlocks(text: string, blocks: ContentBlock[]): void {
  // Split text by lines to handle blockquotes and headers
  const lines = text.split('\n');
  let currentBlock: ContentBlock | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for bullet points (- text)
    if (line.match(/^- .+/)) {
      // Extract the bullet point content
      const listItemContent = line.substring(2);

      // If we were in a non-list block, push it
      if (currentBlock && currentBlock.type !== 'list') {
        blocks.push(currentBlock);
        currentBlock = null;
      }

      // If we don't have a current list, create one
      if (!currentBlock) {
        currentBlock = {
          type: 'list',
          content: '',
          items: [listItemContent],
        };
      } else if (currentBlock.items) {
        // Add item to existing list
        currentBlock.items.push(listItemContent);
      }
    }
    // Check for blockquote
    else if (line.startsWith('> ')) {
      // If we were in a non-blockquote block, push it
      if (currentBlock && currentBlock.type !== 'blockquote') {
        blocks.push(currentBlock);
        currentBlock = null;
      }

      const quoteContent = line.substring(2); // Remove '> ' prefix

      // If we don't have a current blockquote, create one
      if (!currentBlock) {
        currentBlock = {
          type: 'blockquote',
          content: quoteContent,
        };
      } else {
        // Append to existing blockquote with newline
        currentBlock.content = `${currentBlock.content}\n${quoteContent}`;
      }
    }
    // Check for headers (# Header)
    else if (/^#{1,6}\s+.+/.test(line)) {
      // If we were in another block, push it
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }

      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length; // Number of # characters
        const headerContent = match[2];

        blocks.push({
          type: 'header',
          content: headerContent,
          level,
        });
      }
    }
    // Regular text
    else {
      // If we were in a non-text block, push it
      if (currentBlock && currentBlock.type !== 'text') {
        blocks.push(currentBlock);
        currentBlock = null;
      }

      // If we don't have a current text block, create one
      if (!currentBlock) {
        currentBlock = {
          type: 'text',
          content: line,
        };
      } else {
        // Append to existing text block with newline
        currentBlock.content = `${currentBlock.content}\n${line}`;
      }
    }
  }

  // Push the last block if there is one
  if (currentBlock) {
    blocks.push(currentBlock);
  }
}

// Function to format inline markdown for rendering
export function formatInlineMarkdown(text: string): string {
  // First, we need to temporarily replace any code blocks to avoid formatting inside them
  const codeSnippets: string[] = [];

  // Use a unique character sequence that's unlikely to appear in normal text
  const textWithoutCode = text.replace(/`([^`]+)`/g, (_match, code) => {
    const index = codeSnippets.push(code) - 1;
    return `§CODE§${index}§`;
  });

  // Process the text for markdown and URLs
  let processed = textWithoutCode
    // Bold + Italic: ***text*** (must process this before bold and italic)
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold: **text** or __text__
    .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
    // Italic: *text* or _text_
    .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
    // Strikethrough: ~~text~~
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // URLs (http, https, ftp)
    .replace(
      /(https?:\/\/|ftp:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi,
      '<a href="$&" target="_blank" rel="noopener noreferrer">$&</a>'
    );

  // Restore code blocks with a simpler approach to avoid regex issues
  for (let i = 0; i < codeSnippets.length; i++) {
    const placeholder = `§CODE§${i}§`;
    const replacement = `<code>${codeSnippets[i]}</code>`;
    processed = processed.replace(placeholder, replacement);
  }

  return processed;
}
