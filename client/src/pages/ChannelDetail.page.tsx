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
import { RatingButtons } from '../components/RatingButtons';
import { GET_CHANNEL } from '../graphql/channel';
import { CREATE_MESSAGE, GET_MESSAGES_BY_CHANNEL } from '../graphql/message';
import { useUserRatings } from '../hooks/useUserRatings';
import { formatDate, formatDateTime } from '../utils/dateUtils';

interface Message {
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

  const [createMessage, { loading: createLoading }] = useMutation(CREATE_MESSAGE);

  const form = useForm({
    initialValues: {
      content: '',
    },
    validate: {
      content: (value) => (value.length < 1 ? 'Message cannot be empty' : null),
    },
  });

  const { getUserRating, refetch: refetchRatings } = useUserRatings();

  const handleSubmit = async (values: typeof form.values) => {
    if (!id) {
      return;
    }

    try {
      await createMessage({
        variables: {
          channelId: id,
          content: values.content,
        },
      });
      notifications.show({
        title: 'Success',
        message: 'Message posted successfully',
        color: 'green',
      });
      form.reset();
      refetchMessages();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to post message',
        color: 'red',
      });
    }
  };

  const handleRatingChange = () => {
    refetchRatings();
  };

  const loading = channelLoading || messagesLoading;
  const error = channelError || messagesError;

  if (loading && !channelData) {
    return <Loader />;
  }
  if (error) {
    return <Alert color="red">{error.message}</Alert>;
  }
  if (!channelData?.channel) {
    return <Alert color="red">Channel not found</Alert>;
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
            Created by {channel.creator.displayName} on {formatDate(channel.createdAt)}
          </Text>
        </Paper>

        <Title order={3} mb="md">
          Messages
        </Title>

        <Paper withBorder p="md" mb="xl">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Textarea
              placeholder="Type your message here..."
              minRows={3}
              mb="md"
              {...form.getInputProps('content')}
            />
            <Group justify="flex-end">
              <Button type="submit" loading={createLoading}>
                Post Message
              </Button>
            </Group>
          </form>
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
              <Paper key={message.id} withBorder p="md" radius="md">
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

                <Text>{message.content}</Text>

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

                <Group justify="space-between">
                  <RatingButtons
                    contentId={message.id}
                    contentType="message"
                    positiveCount={message.positiveRatings}
                    negativeCount={message.negativeRatings}
                    userRating={getUserRating(message.id, 'message')}
                    onRatingChange={handleRatingChange}
                  />
                  <Button component={Link} to={`/message/${message.id}`} variant="subtle" size="xs">
                    View Replies
                  </Button>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </AppShell>
  );
}
