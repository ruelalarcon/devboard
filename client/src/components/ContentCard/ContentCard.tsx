import { ReactNode } from 'react';
import { Avatar, Box, Divider, Group, Paper, Text } from '@mantine/core';
import { formatDateTime } from '../../utils/dateUtils';
import { DeleteButton } from '../DeleteButton';
import { RatingButtons } from '../RatingButtons';

interface ContentCardProps {
  id: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
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
  return (
    <Paper withBorder p="md" radius="md" mb="xs">
      <Group gap="sm" mb="xs">
        <Avatar color={variant === 'primary' ? 'blue' : 'cyan'} radius="xl">
          {author.displayName[0]}
        </Avatar>
        <div>
          <Text fw={500}>{author.displayName}</Text>
          <Text size="xs" c="dimmed">
            {formatDateTime(createdAt)}
          </Text>
        </div>
      </Group>

      <Text size={variant === 'primary' ? 'lg' : 'md'} my="md">
        {content}
      </Text>

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
