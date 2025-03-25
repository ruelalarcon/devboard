import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AppShell } from '../components/AppShell';
import { ContentCard } from '../components/ContentCard';
import { Reply } from '../components/Reply';
import { ReplyForm } from '../components/ReplyForm';
import {
  CREATE_REPLY,
  GET_MESSAGE,
  GET_NESTED_REPLIES,
  GET_REPLIES_BY_MESSAGE,
} from '../graphql/message';
import { useContent } from '../hooks/useContent';
import { useUserRatings } from '../hooks/useUserRatings';
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
  const { refetch: refetchRatings } = useUserRatings();

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

  const [_createReply, { loading: createLoading }] = useMutation(CREATE_REPLY);
  const { addReply, replyLoading } = useContent({
    contentId: id,
    contentType: 'message',
    onSuccess: () => refetchReplies(),
  });

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

    const success = await addReply(content, replyingTo || undefined);

    if (success && replyingTo) {
      fetchNestedReplies(replyingTo);
      setReplyingTo(null);
    }
  };

  const handleReplyClick = (replyId: string) => {
    setReplyingTo(replyId);
  };

  const handleNestedReply = async (content: string, parentReplyId: string) => {
    const success = await addReply(content, parentReplyId);

    if (success) {
      fetchNestedReplies(parentReplyId);
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

        <ContentCard
          id={message.id}
          content={message.content}
          screenshot={message.screenshot}
          createdAt={message.createdAt}
          author={message.author}
          positiveRatings={message.positiveRatings}
          negativeRatings={message.negativeRatings}
          contentType="message"
          onRatingChange={refetchRatings}
        />

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
            isLoading={createLoading || replyLoading}
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
