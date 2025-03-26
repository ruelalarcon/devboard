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
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AppShell } from '../components/AppShell';
import { ChannelCard } from '../components/ChannelCard';
import { ContentCard } from '../components/ContentCard';
import { UserCard } from '../components/UserCard';
import { useAuth } from '../contexts/AuthContext';
import { DELETE_CHANNEL } from '../graphql/channel';
import { DELETE_USER, GET_USER_PROFILE, UPDATE_USER } from '../graphql/user';

interface Channel {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  channel: {
    id: string;
    name: string;
  };
  positiveRatings: number;
  negativeRatings: number;
}

interface Reply {
  id: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  message: {
    id: string;
    content: string;
    channel: {
      id: string;
      name: string;
    };
  };
  positiveRatings: number;
  negativeRatings: number;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isAdmin: boolean;
  channels: Channel[];
  messages: Message[];
  replies: Reply[];
  createdAt: string;
}

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === id;
  // Check if the current user is an admin
  const isAdmin = currentUser?.isAdmin || false;

  const { data, loading, error, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { id },
    fetchPolicy: 'network-only',
  });

  const [updateUser] = useMutation(UPDATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [deleteChannel] = useMutation(DELETE_CHANNEL);

  const handleAvatarUpdate = async (avatarUrl: string) => {
    try {
      await updateUser({
        variables: {
          avatar: avatarUrl,
        },
      });

      // Refetch the user data
      await refetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update avatar',
        color: 'red',
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser({
        variables: {
          id,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
      });

      // Navigate back to home
      navigate('/home');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete user',
        color: 'red',
      });
    }
  };

  const handleOpenDeleteChannelModal = (channelId: string) => {
    setChannelToDelete(channelId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setChannelToDelete(null);
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) {
      return;
    }

    try {
      await deleteChannel({
        variables: {
          id: channelToDelete,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Channel deleted successfully',
        color: 'green',
      });

      // Refetch the user data to update the UI
      await refetch();
      handleCloseDeleteModal();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete channel',
        color: 'red',
      });
    }
  };

  if (loading) {
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

  if (!data?.user) {
    return (
      <AppShell>
        <Container>
          <Alert color="red">User not found</Alert>
        </Container>
      </AppShell>
    );
  }

  const { user } = data as { user: User };

  return (
    <AppShell>
      <Container>
        <UserCard
          id={user.id}
          displayName={user.displayName}
          username={user.username}
          avatar={user.avatar}
          createdAt={user.createdAt}
          isAdmin={user.isAdmin}
          withButton={false}
          canEditAvatar={isOwnProfile}
          onAvatarUpdate={isOwnProfile ? handleAvatarUpdate : undefined}
          showAdminControls={isAdmin && !isOwnProfile}
          onDeleteUser={isAdmin && !isOwnProfile && !user.isAdmin ? handleDeleteUser : undefined}
        />

        <Tabs defaultValue="channels" style={{ marginTop: '20px' }}>
          <Tabs.List>
            <Tabs.Tab value="channels">Channels ({user.channels.length})</Tabs.Tab>
            <Tabs.Tab value="messages">Messages ({user.messages.length})</Tabs.Tab>
            <Tabs.Tab value="replies">Replies ({user.replies.length})</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="channels" pt="md">
            {user.channels.length === 0 ? (
              <Text c="dimmed">No channels created</Text>
            ) : (
              <Stack>
                {user.channels.map((channel: Channel) => (
                  <ChannelCard
                    key={channel.id}
                    id={channel.id}
                    name={channel.name}
                    description={channel.description}
                    createdAt={channel.createdAt}
                    compact
                    showAdminControls={isAdmin}
                    onDeleteChannel={
                      isAdmin ? () => handleOpenDeleteChannelModal(channel.id) : undefined
                    }
                  />
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="messages" pt="md">
            {user.messages.length === 0 ? (
              <Text c="dimmed">No messages posted</Text>
            ) : (
              <Stack>
                {user.messages.map((message: Message) => (
                  <Box key={message.id}>
                    <ContentCard
                      id={message.id}
                      content={message.content}
                      screenshot={message.screenshot}
                      createdAt={message.createdAt}
                      author={user}
                      positiveRatings={message.positiveRatings}
                      negativeRatings={message.negativeRatings}
                      contentType="message"
                      onRatingChange={() => {}}
                    >
                      <Group>
                        <Text size="xs" c="dimmed">
                          Posted in{' '}
                          <Link to={`/channel/${message.channel.id}`}>{message.channel.name}</Link>
                        </Text>
                        <Button
                          component={Link}
                          to={`/message/${message.id}`}
                          variant="subtle"
                          size="xs"
                        >
                          View Replies
                        </Button>
                      </Group>
                    </ContentCard>
                  </Box>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="replies" pt="md">
            {user.replies.length === 0 ? (
              <Text c="dimmed">No replies posted</Text>
            ) : (
              <Stack>
                {user.replies.map((reply: Reply) => (
                  <Box key={reply.id}>
                    <ContentCard
                      id={reply.id}
                      content={reply.content}
                      screenshot={reply.screenshot}
                      createdAt={reply.createdAt}
                      author={user}
                      positiveRatings={reply.positiveRatings}
                      negativeRatings={reply.negativeRatings}
                      contentType="reply"
                      onRatingChange={() => {}}
                      variant="secondary"
                    >
                      <Text size="xs" c="dimmed">
                        Reply to a message in{' '}
                        <Link to={`/channel/${reply.message.channel.id}`}>
                          {reply.message.channel.name}
                        </Link>
                      </Text>
                      <Button
                        component={Link}
                        to={`/message/${reply.message.id}`}
                        variant="subtle"
                        size="xs"
                      >
                        View Thread
                      </Button>
                    </ContentCard>
                  </Box>
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Delete Channel Confirmation Modal */}
        <Modal
          opened={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          title="Confirm Channel Deletion"
          centered
        >
          <Text mb="md">
            Are you sure you want to delete this channel? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteChannel}>
              Delete Channel
            </Button>
          </Group>
        </Modal>
      </Container>
    </AppShell>
  );
}
