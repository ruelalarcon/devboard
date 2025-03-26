import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { AppShell } from '../components/AppShell';
import { ChannelCard } from '../components/ChannelCard';
import { useAuth } from '../contexts/AuthContext';
import { CREATE_CHANNEL, DELETE_CHANNEL, GET_CHANNELS } from '../graphql/channel';

interface Channel {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  creator: {
    id: string;
    displayName: string;
  };
}

export function HomePage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  const { loading, error, data, refetch } = useQuery(GET_CHANNELS);
  const [createChannel, { loading: createLoading }] = useMutation(CREATE_CHANNEL);
  const [deleteChannel] = useMutation(DELETE_CHANNEL);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Channel name must be at least 3 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await createChannel({
        variables: {
          name: values.name,
          description: values.description || undefined,
        },
      });
      notifications.show({
        title: 'Success',
        message: 'Channel created successfully',
        color: 'green',
      });
      form.reset();
      setCreateModalOpen(false);
      refetch();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create channel',
        color: 'red',
      });
    }
  };

  const handleOpenDeleteModal = (channelId: string) => {
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

      // Refetch channels to update the UI
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

  return (
    <AppShell>
      <Container>
        <Group justify="space-between" mb="xl">
          <Title>Home</Title>
          <Button onClick={() => setCreateModalOpen(true)}>Create Channel</Button>
        </Group>

        {loading && <Loader />}
        {error && (
          <Alert color="red" title="Error">
            {error.message}
          </Alert>
        )}

        {data?.channels && (
          <Stack>
            {data.channels.length === 0 ? (
              <Text c="dimmed" ta="center">
                No channels yet. Create the first channel!
              </Text>
            ) : (
              data.channels.map((channel: Channel) => (
                <ChannelCard
                  key={channel.id}
                  id={channel.id}
                  name={channel.name}
                  description={channel.description}
                  createdAt={channel.createdAt}
                  creator={channel.creator}
                  showAdminControls={isAdmin}
                  onDeleteChannel={isAdmin ? () => handleOpenDeleteModal(channel.id) : undefined}
                />
              ))
            )}
          </Stack>
        )}

        <Modal
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create New Channel"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Channel Name"
              placeholder="Enter channel name"
              required
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Enter channel description (optional)"
              mt="md"
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={createLoading}>
                Create
              </Button>
            </Group>
          </form>
        </Modal>

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
