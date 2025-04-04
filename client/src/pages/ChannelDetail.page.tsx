import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AppShell } from '../components/AppShell';
import { ContentCard } from '../components/ContentCard';
import { ReplyForm } from '../components/ReplyForm';
import { useAuth } from '../contexts/AuthContext';
import { DELETE_CHANNEL, GET_CHANNEL } from '../graphql/channel';
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Check if the current user is an admin
  const isAdmin = user?.isAdmin || false;

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
  const [deleteChannel] = useMutation(DELETE_CHANNEL);

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

  const handleOpenDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteChannel = async () => {
    if (!id) {
      return;
    }

    try {
      await deleteChannel({
        variables: {
          id,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Channel deleted successfully',
        color: 'green',
      });

      // Navigate back to home
      navigate('/home');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete channel',
        color: 'red',
      });
    }
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
          <Button component={Link} to="/home" variant="subtle" size="sm" data-cy="back-button">
            ← Back to Home
          </Button>
          {isAdmin && (
            <Button
              color="red"
              variant="subtle"
              size="sm"
              onClick={handleOpenDeleteModal}
              data-cy="admin-delete-channel"
            >
              Delete Channel
            </Button>
          )}
        </Group>

        <Paper withBorder p="md" mb="xl" data-cy="channel-header">
          <Title order={2} data-cy="channel-title">
            {channel.name}
          </Title>
          {channel.description && (
            <Text mt="xs" data-cy="channel-description">
              {channel.description}
            </Text>
          )}
          <Text size="sm" c="dimmed" mt="xs" data-cy="channel-creator">
            Created by <Link to={`/user/${channel.creator.id}`}>{channel.creator.displayName}</Link>{' '}
            on {formatDate(channel.createdAt)}
          </Text>
        </Paper>

        <Title order={3} mb="md" data-cy="messages-section-title">
          Messages
        </Title>

        <Paper withBorder p="md" mb="xl">
          <ReplyForm
            onSubmit={handleSubmit}
            initialContent=""
            isLoading={createLoading || contentLoading}
            placeholder="Type your message here..."
            data-cy="channel-message-form"
          />
        </Paper>

        {messagesLoading ? (
          <Loader />
        ) : messages.length === 0 ? (
          <Text c="dimmed" ta="center" data-cy="no-messages">
            No messages yet. Be the first to post!
          </Text>
        ) : (
          <Stack gap="lg" data-cy="message-list">
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
                  <Button
                    component={Link}
                    to={`/message/${message.id}`}
                    variant="subtle"
                    size="xs"
                    data-cy="view-replies-button"
                  >
                    View Replies
                  </Button>
                </ContentCard>
              </Box>
            ))}
          </Stack>
        )}

        {/* Delete Channel Confirmation Modal */}
        <Modal
          opened={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          title="Confirm Channel Deletion"
          centered
          data-cy="delete-channel-modal"
        >
          <Text mb="md">
            Are you sure you want to delete this channel? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={handleCloseDeleteModal}
              data-cy="cancel-delete-channel"
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteChannel} data-cy="confirm-delete-channel">
              Delete Channel
            </Button>
          </Group>
        </Modal>
      </Container>
    </AppShell>
  );
}
