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
import { CREATE_CHANNEL, GET_CHANNELS } from '../graphql/channel';

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
  const { loading, error, data, refetch } = useQuery(GET_CHANNELS);
  const [createChannel, { loading: createLoading }] = useMutation(CREATE_CHANNEL);

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
                No channels yet. Create your first channel!
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
      </Container>
    </AppShell>
  );
}
