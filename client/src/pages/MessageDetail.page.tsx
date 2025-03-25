import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { GET_MESSAGE, GET_NESTED_REPLIES, GET_REPLIES_BY_MESSAGE } from '../graphql/message';
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
    username: string;
    avatar?: string;
  };
  positiveRatings: number;
  negativeRatings: number;
  replies: { id: string }[];
}

export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  const {
    addReply,
    removeMessage,
    removeReply,
    isLoading: contentLoading,
  } = useContent({
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

  const handleSubmitReply = async (content: string, file: File | null) => {
    if (!id) {
      return;
    }

    const success = await addReply(content, file, replyingTo || undefined);

    if (success) {
      if (replyingTo) {
        // Refetch nested replies if replying to a reply
        fetchNestedReplies(replyingTo);
        setReplyingTo(null);
      }
    }
  };

  const handleReplyClick = (replyId: string) => {
    setReplyingTo(replyId);
  };

  const handleNestedReply = async (content: string, parentReplyId: string, file: File | null) => {
    const success = await addReply(content, file, parentReplyId);

    if (success) {
      fetchNestedReplies(parentReplyId);
    }
  };

  const handleDeleteMessage = async () => {
    if (!id) {
      return;
    }

    const success = await removeMessage(id);
    if (success) {
      // Navigate back to the channel
      const channelId = messageData?.message?.channel?.id;
      if (channelId) {
        navigate(`/channel/${channelId}`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    const success = await removeReply(replyId);

    if (success) {
      // Refetch replies to update the UI
      refetchReplies();

      // If this was a nested reply, refetch the parent's nested replies
      Object.keys(nestedReplies).forEach((parentId) => {
        if (nestedReplies[parentId].some((reply) => reply.id === replyId)) {
          fetchNestedReplies(parentId);
        }
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
              onDelete={() => handleDeleteReply(reply.id)}
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

  const replyPlaceholder = replyingTo
    ? 'Write your reply to this comment...'
    : 'Write your reply...';

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
          onDelete={handleDeleteMessage}
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
            onCancel={replyingTo ? () => setReplyingTo(null) : undefined}
            initialContent=""
            isLoading={contentLoading}
            placeholder={replyPlaceholder}
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
