import { useState } from 'react';
import { Avatar, Box, Button, Divider, Group, Paper, Text } from '@mantine/core';
import { useUserRatings } from '../../hooks/useUserRatings';
import { formatDateTime } from '../../utils/dateUtils';
import { RatingButtons } from '../RatingButtons';
import { ReplyForm } from '../ReplyForm';
import classes from './Reply.module.css';

interface ReplyProps {
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
  level?: number;
  onReply: (replyId: string) => void;
  onSubmitNestedReply?: (content: string, parentReplyId: string) => Promise<void>;
  children?: React.ReactNode;
}

export function Reply({
  id,
  content,
  screenshot,
  createdAt,
  author,
  positiveRatings,
  negativeRatings,
  level = 0,
  onReply,
  onSubmitNestedReply,
  children,
}: ReplyProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { refetch: refetchRatings } = useUserRatings();

  const handleReplyClick = () => {
    if (onSubmitNestedReply) {
      setShowReplyForm(true);
    } else {
      onReply(id);
    }
  };

  const handleSubmitReply = async (content: string) => {
    if (onSubmitNestedReply) {
      await onSubmitNestedReply(content, id);
      setShowReplyForm(false);
    }
  };

  return (
    <Box className={classes.replyContainer}>
      <Paper
        withBorder
        p="md"
        radius="md"
        ml={level * 40}
        mb="xs"
        className={`${classes.replyPaper} ${level > 0 ? classes.nestedReply : ''}`}
      >
        <Group gap="sm" mb="xs">
          <Avatar color={level === 0 ? 'cyan' : 'blue'} radius="xl">
            {author.displayName[0]}
          </Avatar>
          <div>
            <Text fw={500}>{author.displayName}</Text>
            <Text size="xs" c="dimmed">
              {formatDateTime(createdAt)}
            </Text>
          </div>
        </Group>

        <Text>{content}</Text>

        {screenshot && (
          <Box my="md">
            <img
              src={screenshot}
              alt="Screenshot"
              style={{ maxWidth: '100%', maxHeight: '300px' }}
            />
          </Box>
        )}

        <Divider my="sm" />

        <Group justify="space-between">
          <RatingButtons
            contentId={id}
            contentType="reply"
            positiveCount={positiveRatings}
            negativeCount={negativeRatings}
            onRatingChange={refetchRatings}
          />

          <Button variant="subtle" size="xs" onClick={handleReplyClick}>
            Reply
          </Button>
        </Group>

        {showReplyForm && (
          <Box className={classes.replyForm}>
            <ReplyForm onSubmit={handleSubmitReply} onCancel={() => setShowReplyForm(false)} />
          </Box>
        )}
      </Paper>
      {children}
    </Box>
  );
}
