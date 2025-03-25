import { useState } from 'react';
import { Avatar, Box, Button, Divider, Group, Paper, Text, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
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

  const form = useForm({
    initialValues: {
      content: '',
    },
    validate: {
      content: (value) => (value.length < 1 ? 'Reply cannot be empty' : null),
    },
  });

  const handleReplyClick = () => {
    if (onSubmitNestedReply) {
      setShowReplyForm(true);
    } else {
      onReply(id);
    }
  };

  const handleSubmit = async (values: { content: string }) => {
    if (onSubmitNestedReply) {
      await onSubmitNestedReply(values.content, id);
      form.reset();
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
              {new Date(createdAt).toLocaleString()}
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
          <Group gap="xs">
            <Text size="sm">
              <span role="img" aria-label="Thumbs up">
                👍
              </span>{' '}
              {positiveRatings}
            </Text>
            <Text size="sm">
              <span role="img" aria-label="Thumbs down">
                👎
              </span>{' '}
              {negativeRatings}
            </Text>
          </Group>

          <Button variant="subtle" size="xs" onClick={handleReplyClick}>
            Reply
          </Button>
        </Group>

        {showReplyForm && (
          <Box className={classes.replyForm}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Textarea
                placeholder="Write your reply..."
                minRows={2}
                mb="sm"
                {...form.getInputProps('content')}
              />
              <Group justify="flex-end">
                <Button variant="subtle" size="xs" onClick={() => setShowReplyForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="xs">
                  Post Reply
                </Button>
              </Group>
            </form>
          </Box>
        )}
      </Paper>
      {children}
    </Box>
  );
}
