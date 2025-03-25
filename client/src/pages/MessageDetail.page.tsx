import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { AppShell } from '../components/AppShell';
import { Reply } from '../components/Reply';
import {
  CREATE_REPLY,
  GET_MESSAGE,
  GET_NESTED_REPLIES,
  GET_REPLIES_BY_MESSAGE,
} from '../graphql/message';
import { client } from '../lib/apolloClient';

interface ReplyType {
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
  replies: { id: string }[];
}

export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [nestedReplies, setNestedReplies] = useState<Record<string, ReplyType[]>>({});

  const {
    loading: messageLoading,
    error: messageError,
    data: messageData,
  } = useQuery(GET_MESSAGE, {
    variables: { id },
    skip: !id,
  });

  const {
    loading: repliesLoading,
    error: repliesError,
    data: repliesData,
    refetch: refetchReplies,
  } = useQuery(GET_REPLIES_BY_MESSAGE, {
    variables: { messageId: id },
    skip: !id,
  });

  const [createReply, { loading: createLoading }] = useMutation(CREATE_REPLY);

  const fetchNestedReplies = async (parentReplyId: string) => {
    try {
      const { data } = await client.query({
        query: GET_NESTED_REPLIES,
        variables: { parentReplyId },
      });

      if (data?.repliesByParentReply) {
        setNestedReplies((prev) => ({
          ...prev,
          [parentReplyId]: data.repliesByParentReply,
        }));
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to fetch nested replies',
        color: 'red',
      });
    }
  };

  const form = useForm({
    initialValues: {
      content: '',
    },
    validate: {
      content: (value) => (value.length < 1 ? 'Reply cannot be empty' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!id) {
      return;
    }

    try {
      await createReply({
        variables: {
          messageId: id,
          content: values.content,
          parentReplyId: replyingTo || undefined,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Reply posted successfully',
        color: 'green',
      });

      form.reset();
      setReplyingTo(null);

      if (replyingTo) {
        // Refetch nested replies if replying to a reply
        fetchNestedReplies(replyingTo);
      } else {
        refetchReplies();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to post reply',
        color: 'red',
      });
    }
  };

  const handleReplyClick = (replyId: string) => {
    setReplyingTo(replyId);
  };

  const handleNestedReply = async (content: string, parentReplyId: string) => {
    if (!id) {
      return;
    }

    try {
      await createReply({
        variables: {
          messageId: id,
          content,
          parentReplyId,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Reply posted successfully',
        color: 'green',
      });

      // Refetch nested replies for this parent
      fetchNestedReplies(parentReplyId);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to post reply',
        color: 'red',
      });
    }
  };

  const renderReplies = (replies: ReplyType[], level = 0) => {
    return (
      <Stack gap="xs">
        {replies.map((reply) => (
          <Box key={reply.id}>
            <Reply
              id={reply.id}
              content={reply.content}
              screenshot={reply.screenshot}
              createdAt={reply.createdAt}
              author={reply.author}
              positiveRatings={reply.positiveRatings}
              negativeRatings={reply.negativeRatings}
              level={level}
              onReply={handleReplyClick}
              onSubmitNestedReply={handleNestedReply}
            >
              {nestedReplies[reply.id] &&
                nestedReplies[reply.id].length > 0 &&
                renderReplies(nestedReplies[reply.id], level + 1)}
              {reply.replies.length > 0 && !nestedReplies[reply.id] && (
                <Button
                  variant="subtle"
                  size="xs"
                  ml={(level + 1) * 40}
                  mb="sm"
                  onClick={() => fetchNestedReplies(reply.id)}
                >
                  Show {reply.replies.length} nested{' '}
                  {reply.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </Reply>
          </Box>
        ))}
      </Stack>
    );
  };

  const loading = messageLoading || repliesLoading;
  const error = messageError || repliesError;

  if (loading && !messageData) {
    return (
      <AppShell>
        <Container>
          <Loader />
        </Container>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Container>
          <Alert color="red">{error.message}</Alert>
        </Container>
      </AppShell>
    );
  }

  if (!messageData?.message) {
    return (
      <AppShell>
        <Container>
          <Alert color="red">Message not found</Alert>
        </Container>
      </AppShell>
    );
  }

  const { message } = messageData;
  const replies = repliesData?.repliesByMessage || [];

  return (
    <AppShell>
      <Container>
        <Group mb="md">
          <Button component={Link} to={`/channel/${message.channel.id}`} variant="subtle" size="sm">
            ← Back to {message.channel.name}
          </Button>
        </Group>

        <Paper withBorder p="md" mb="xl" radius="md">
          <Group gap="sm" mb="xs">
            <Avatar color="blue" radius="xl">
              {message.author.displayName[0]}
            </Avatar>
            <div>
              <Text fw={500}>{message.author.displayName}</Text>
              <Text size="xs" c="dimmed">
                {new Date(message.createdAt).toLocaleString()}
              </Text>
            </div>
          </Group>

          <Text size="lg" my="md">
            {message.content}
          </Text>

          {message.screenshot && (
            <Box my="md">
              <img
                src={message.screenshot}
                alt="Screenshot"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </Box>
          )}

          <Divider my="sm" />

          <Group>
            <Text size="sm">
              <span role="img" aria-label="Thumbs up">
                👍
              </span>{' '}
              {message.positiveRatings}
            </Text>
            <Text size="sm">
              <span role="img" aria-label="Thumbs down">
                👎
              </span>{' '}
              {message.negativeRatings}
            </Text>
          </Group>
        </Paper>

        <Group justify="space-between" mb="md">
          <Title order={3}>
            Replies
            {replyingTo && ' (Replying to another comment)'}
          </Title>
          {replyingTo && (
            <Button variant="subtle" onClick={() => setReplyingTo(null)}>
              Cancel Reply
            </Button>
          )}
        </Group>

        <Paper withBorder p="md" mb="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Textarea
              placeholder={
                replyingTo ? 'Type your reply to this comment...' : 'Type your reply here...'
              }
              minRows={3}
              mb="md"
              {...form.getInputProps('content')}
            />
            <Group justify="flex-end">
              <Button type="submit" loading={createLoading}>
                Post Reply
              </Button>
            </Group>
          </form>
        </Paper>

        {repliesLoading ? (
          <Loader />
        ) : replies.length === 0 ? (
          <Text c="dimmed" ta="center">
            No replies yet. Be the first to reply!
          </Text>
        ) : (
          renderReplies(replies)
        )}
      </Container>
    </AppShell>
  );
}
