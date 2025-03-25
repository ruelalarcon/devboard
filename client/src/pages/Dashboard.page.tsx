import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
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
import { CREATE_CHANNEL, GET_CHANNELS } from '../graphql/channel';
import { formatDate } from '../utils/dateUtils';

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

export function DashboardPage() {
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
          <Title>Dashboard</Title>
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
                <Card key={channel.id} withBorder shadow="sm" p="lg" radius="md">
                  <Group justify="space-between">
                    <div>
                      <Title order={4}>{channel.name}</Title>
                      {channel.description && <Text>{channel.description}</Text>}
                      <Text size="sm" c="dimmed">
                        Created by{' '}
                        <Link to={`/user/${channel.creator.id}`}>
                          {channel.creator.displayName}
                        </Link>{' '}
                        on {formatDate(channel.createdAt)}
                      </Text>
                    </div>
                    <Button component={Link} to={`/channel/${channel.id}`} variant="outline">
                      View Channel
                    </Button>
                  </Group>
                </Card>
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
