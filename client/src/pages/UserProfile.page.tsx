import { useQuery } from '@apollo/client';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { AppShell } from '../components/AppShell';
import { ContentCard } from '../components/ContentCard';
import { GET_USER_PROFILE } from '../graphql/user';
import { formatDate } from '../utils/dateUtils';

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
}

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery(GET_USER_PROFILE, {
    variables: { id },
    fetchPolicy: 'network-only',
  });

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
        <Card withBorder p="xl" radius="md" mb="xl">
          <Group>
            <Avatar color="blue" radius="xl" size="xl">
              {user.displayName[0]}
            </Avatar>
            <div>
              <Title order={2}>{user.displayName}</Title>
              <Text c="dimmed">@{user.username}</Text>
              {user.isAdmin && (
                <Text size="sm" c="blue" fw={500}>
                  Administrator
                </Text>
              )}
            </div>
          </Group>
        </Card>

        <Tabs defaultValue="channels">
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
                  <Card key={channel.id} withBorder p="md">
                    <Link
                      to={`/channel/${channel.id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Text fw={500} size="lg">
                        {channel.name}
                      </Text>
                      {channel.description && (
                        <Text c="dimmed" size="sm">
                          {channel.description}
                        </Text>
                      )}
                      <Text size="xs" c="dimmed" mt="sm">
                        Created on {formatDate(channel.createdAt)}
                      </Text>
                    </Link>
                  </Card>
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
      </Container>
    </AppShell>
  );
}
