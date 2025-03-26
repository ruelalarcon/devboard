import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CodeHighlight } from '@mantine/code-highlight';
import { Avatar, Box, Divider, Group, Paper, Text } from '@mantine/core';
import { parseContent } from '../../utils/contentUtils';
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

  return (
    <Paper withBorder p="md" radius="md" mb="xs">
      <Group gap="sm" mb="xs">
        <Link to={`/user/${author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Avatar color={variant === 'primary' ? 'blue' : 'cyan'} radius="xl">
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
            {block.type === 'text' ? (
              <Text
                size={variant === 'primary' ? 'lg' : 'md'}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {block.content}
              </Text>
            ) : (
              <CodeHighlight
                code={block.content}
                language={block.language}
                withCopyButton
                my="xs"
              />
            )}
          </Box>
        ))}
      </Box>

      {screenshot && (
        <Box my="md">
          <img src={screenshot} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: '300px' }} />
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
