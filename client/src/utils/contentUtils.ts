interface ContentBlock {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

export function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block if any
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
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
    blocks.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return blocks;
}
