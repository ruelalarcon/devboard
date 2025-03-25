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
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AppShell } from '../components/AppShell';
import { RatingButtons } from '../components/RatingButtons';
import { Reply } from '../components/Reply';
import { ReplyForm } from '../components/ReplyForm';
import {
  CREATE_REPLY,
  GET_MESSAGE,
  GET_NESTED_REPLIES,
  GET_REPLIES_BY_MESSAGE,
} from '../graphql/message';
import { useUserRatings } from '../hooks/useUserRatings';
import { client } from '../lib/apolloClient';
import { formatDateTime } from '../utils/dateUtils';

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

interface MessageContent {
  id: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  positiveRatings: number;
  negativeRatings: number;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  channel: {
    id: string;
    name: string;
  };
}

function MessageHeader({ message }: { message: MessageContent }) {
  const { refetch: refetchRatings } = useUserRatings();

  return (
    <Paper withBorder p="md" mb="xl" radius="md">
      <Group gap="sm" mb="xs">
        <Avatar color="blue" radius="xl">
          {message.author.displayName[0]}
        </Avatar>
        <div>
          <Text fw={500}>{message.author.displayName}</Text>
          <Text size="xs" c="dimmed">
            {formatDateTime(message.createdAt)}
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

      <RatingButtons
        contentId={message.id}
        contentType="message"
        positiveCount={message.positiveRatings}
        negativeCount={message.negativeRatings}
        onRatingChange={refetchRatings}
      />
    </Paper>
  );
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

  const handleSubmitReply = async (content: string) => {
    if (!id) {
      return;
    }

    try {
      await createReply({
        variables: {
          messageId: id,
          content,
          parentReplyId: replyingTo || undefined,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Reply posted successfully',
        color: 'green',
      });

      if (replyingTo) {
        // Refetch nested replies if replying to a reply
        fetchNestedReplies(replyingTo);
        setReplyingTo(null);
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

  // Handle loading and error states
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

        <MessageHeader message={message} />

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
          <ReplyForm
            onSubmit={handleSubmitReply}
            onCancel={() => {}}
            initialContent=""
            isLoading={createLoading}
          />
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
