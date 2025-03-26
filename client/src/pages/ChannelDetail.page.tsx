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
import { AppShell } from '../components/AppShell';
import { ContentCard } from '../components/ContentCard';
import { ReplyForm } from '../components/ReplyForm';
import { GET_CHANNEL } from '../graphql/channel';
import { CREATE_MESSAGE, GET_MESSAGES_BY_CHANNEL } from '../graphql/message';
import { useContent } from '../hooks/useContent';
import { formatDate } from '../utils/dateUtils';

interface Message {
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
}

export function ChannelDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    loading: channelLoading,
    error: channelError,
    data: channelData,
  } = useQuery(GET_CHANNEL, {
    variables: { id },
    skip: !id,
  });

  const {
    loading: messagesLoading,
    error: messagesError,
    data: messagesData,
    refetch: refetchMessages,
  } = useQuery(GET_MESSAGES_BY_CHANNEL, {
    variables: { channelId: id },
    skip: !id,
  });

  const [_createMessage, { loading: createLoading }] = useMutation(CREATE_MESSAGE);
  const {
    addMessage,
    removeMessage,
    isLoading: contentLoading,
  } = useContent({
    contentType: 'channel',
    onSuccess: () => refetchMessages(),
  });

  const handleSubmit = async (content: string, file: File | null) => {
    if (!id) {
      return;
    }

    await addMessage(id, content, file);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await removeMessage(messageId);
  };

  const loading = channelLoading || messagesLoading;
  const error = channelError || messagesError;

  if (loading && !channelData) {
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

  if (!channelData?.channel) {
    return (
      <AppShell>
        <Container>
          <Alert color="red">Channel not found</Alert>
        </Container>
      </AppShell>
    );
  }

  const { channel } = channelData;
  const messages = messagesData?.messagesByChannel || [];

  return (
    <AppShell>
      <Container>
        <Group mb="md">
          <Button component={Link} to="/dashboard" variant="subtle" size="sm">
            ← Back to Dashboard
          </Button>
        </Group>

        <Paper withBorder p="md" mb="xl">
          <Title order={2}>{channel.name}</Title>
          {channel.description && <Text mt="xs">{channel.description}</Text>}
          <Text size="sm" c="dimmed" mt="xs">
            Created by <Link to={`/user/${channel.creator.id}`}>{channel.creator.displayName}</Link>{' '}
            on {formatDate(channel.createdAt)}
          </Text>
        </Paper>

        <Title order={3} mb="md">
          Messages
        </Title>

        <Paper withBorder p="md" mb="xl">
          <ReplyForm
            onSubmit={handleSubmit}
            initialContent=""
            isLoading={createLoading || contentLoading}
            placeholder="Type your message here..."
          />
        </Paper>

        {messagesLoading ? (
          <Loader />
        ) : messages.length === 0 ? (
          <Text c="dimmed" ta="center">
            No messages yet. Be the first to post!
          </Text>
        ) : (
          <Stack gap="lg">
            {messages.map((message: Message) => (
              <Box key={message.id}>
                <ContentCard
                  id={message.id}
                  content={message.content}
                  screenshot={message.screenshot}
                  createdAt={message.createdAt}
                  author={message.author}
                  positiveRatings={message.positiveRatings}
                  negativeRatings={message.negativeRatings}
                  contentType="message"
                  onRatingChange={() => {}}
                  onDelete={() => handleDeleteMessage(message.id)}
                >
                  <Button component={Link} to={`/message/${message.id}`} variant="subtle" size="xs">
                    View Replies
                  </Button>
                </ContentCard>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </AppShell>
  );
}
