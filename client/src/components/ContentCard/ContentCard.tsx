import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CodeHighlight } from '@mantine/code-highlight';
import { Avatar, Blockquote, Box, Divider, Group, List, Paper, Text, Title } from '@mantine/core';
import { uploadConfig } from '../../config/upload';
import { formatInlineMarkdown, parseContent } from '../../utils/contentUtils';
import { formatDateTime } from '../../utils/dateUtils';
import { DeleteButton } from '../DeleteButton/DeleteButton';
import { RatingButtons } from '../RatingButtons';

interface ContentCardProps {
  id: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
  positiveRatings: number;
  negativeRatings: number;
  contentType: 'message' | 'reply' | 'channel';
  onRatingChange: () => void;
  onDelete?: () => Promise<void>;
  children?: ReactNode;
  variant?: 'primary' | 'secondary';
}

export function ContentCard({
  id,
  content,
  screenshot,
  createdAt,
  author,
  positiveRatings,
  negativeRatings,
  contentType,
  onRatingChange,
  onDelete,
  children,
  variant = 'primary',
}: ContentCardProps) {
  const contentBlocks = parseContent(content);

  // Ensure the screenshot URL is a full URL
  const fullScreenshotUrl = screenshot && uploadConfig.getFullUrl(screenshot);

  return (
    <Paper withBorder p="md" radius="md" mb="xs">
      <Group gap="sm" mb="xs">
        <Link to={`/user/${author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Avatar src={author.avatar} color={variant === 'primary' ? 'blue' : 'cyan'} radius="xl">
            {author.displayName[0]}
          </Avatar>
        </Link>
        <div>
          <Link to={`/user/${author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Text fw={500}>{author.displayName}</Text>
            <Text size="sm" c="dimmed">
              @{author.username}
            </Text>
          </Link>
          <Text size="xs" c="dimmed">
            {formatDateTime(createdAt)}
          </Text>
        </div>
      </Group>

      <Box my="md">
        {contentBlocks.map((block, index) => (
          <Box key={index} mb={block.type === 'code' ? 'md' : 'xs'}>
            {block.type === 'text' && (
              <Text
                size={variant === 'primary' ? 'lg' : 'md'}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }}
              />
            )}
            {block.type === 'code' && (
              <CodeHighlight
                code={block.content}
                language={block.language}
                withCopyButton
                my="xs"
                styles={{
                  root: {
                    borderRadius: '0.25rem',
                  },
                  code: {
                    fontSize: '.85rem',
                  },
                  pre: {
                    fontSize: '.85rem',
                  },
                }}
              />
            )}
            {block.type === 'blockquote' && (
              <Blockquote
                color="blue"
                iconSize={20}
                radius="md"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  paddingInline: '10px',
                  paddingBlock: '5px',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }} />
              </Blockquote>
            )}
            {block.type === 'header' && block.level && (
              <Title order={block.level as 1 | 2 | 3 | 4 | 5 | 6}>
                <div dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.content) }} />
              </Title>
            )}
            {block.type === 'list' && block.items && (
              <List spacing="xs" size={variant === 'primary' ? 'md' : 'sm'} withPadding>
                {block.items.map((item, itemIndex) => (
                  <List.Item key={itemIndex}>
                    <div dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                  </List.Item>
                ))}
              </List>
            )}
          </Box>
        ))}
      </Box>

      {fullScreenshotUrl && (
        <Box my="md">
          <img
            src={fullScreenshotUrl}
            alt="Screenshot"
            style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '0.25rem' }}
          />
        </Box>
      )}

      <Divider my="sm" />

      <Group justify="space-between">
        <RatingButtons
          contentId={id}
          contentType={contentType === 'channel' ? 'message' : contentType}
          positiveCount={positiveRatings}
          negativeCount={negativeRatings}
          onRatingChange={onRatingChange}
        />
        <Group>
          {onDelete && contentType !== 'channel' && (
            <DeleteButton
              contentType={contentType}
              authorId={author.id}
              onDelete={onDelete}
              size={variant === 'primary' ? 'sm' : 'xs'}
            />
          )}
          {children}
        </Group>
      </Group>
    </Paper>
  );
}
