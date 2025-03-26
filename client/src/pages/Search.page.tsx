import { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Loader,
  Paper,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { AppShell } from '../components/AppShell';
import { ChannelCard } from '../components/ChannelCard';
import { ContentCard } from '../components/ContentCard';
import { UserCard } from '../components/UserCard';
import { SEARCH_CHANNELS, SEARCH_MESSAGES, SEARCH_USERS } from '../graphql/search';

type SearchType = 'channels' | 'messages' | 'users';

export function SearchPage() {
  const [activeTab, setActiveTab] = useState<SearchType>('channels');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm({
    initialValues: {
      searchTerm: '',
    },
    validate: {
      searchTerm: (value) => (!value ? 'Search term is required' : null),
    },
  });

  const [searchChannels, { loading: channelsLoading, data: channelsData, error: channelsError }] =
    useLazyQuery(SEARCH_CHANNELS, { fetchPolicy: 'network-only' });

  const [searchMessages, { loading: messagesLoading, data: messagesData, error: messagesError }] =
    useLazyQuery(SEARCH_MESSAGES, { fetchPolicy: 'network-only' });

  const [searchUsers, { loading: usersLoading, data: usersData, error: usersError }] = useLazyQuery(
    SEARCH_USERS,
    { fetchPolicy: 'network-only' }
  );

  const handleSearch = (values: typeof form.values) => {
    setHasSearched(true);
    const sortOption = sortBy === 'recent' ? 'recent' : 'rating';

    // Only execute the query for the active tab
    if (activeTab === 'channels') {
      searchChannels({ variables: { searchTerm: values.searchTerm, sortBy: sortOption } });
    } else if (activeTab === 'messages') {
      searchMessages({ variables: { searchTerm: values.searchTerm, sortBy: sortOption } });
    } else if (activeTab === 'users') {
      searchUsers({ variables: { searchTerm: values.searchTerm, sortBy: sortOption } });
    }
  };

  // Clear loading state and data when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value as SearchType);
    setHasSearched(false);
  };

  // Only look at the loading/error state for the active tab
  const loading =
    (activeTab === 'channels' && channelsLoading) ||
    (activeTab === 'messages' && messagesLoading) ||
    (activeTab === 'users' && usersLoading);

  const error =
    (activeTab === 'channels' && channelsError) ||
    (activeTab === 'messages' && messagesError) ||
    (activeTab === 'users' && usersError);

  const renderChannelResults = () => {
    if (!hasSearched || activeTab !== 'channels') {
      return null;
    }

    const channels = channelsData?.searchChannels || [];

    if (channels.length === 0) {
      return <Text c="dimmed">No channels found matching your search.</Text>;
    }

    return (
      <Stack>
        {channels.map((channel: any) => (
          <ChannelCard
            key={channel.id}
            id={channel.id}
            name={channel.name}
            description={channel.description}
            createdAt={channel.createdAt}
            creator={channel.creator}
          />
        ))}
      </Stack>
    );
  };

  const renderMessageResults = () => {
    if (!hasSearched || activeTab !== 'messages') {
      return null;
    }

    const messages = messagesData?.searchMessages || [];

    if (messages.length === 0) {
      return <Text c="dimmed">No messages found matching your search.</Text>;
    }

    return (
      <Stack>
        {messages.map((message: any) => (
          <Box key={message.id}>
            <Text size="sm" mb="xs">
              Found in channel:{' '}
              <Link to={`/channel/${message.channel.id}`}>{message.channel.name}</Link>
            </Text>
            <ContentCard
              id={message.id}
              content={message.content}
              screenshot={message.screenshot}
              createdAt={message.createdAt}
              author={message.author}
              positiveRatings={message.positiveRatings}
              negativeRatings={message.negativeRatings}
              contentType="message"
              onRatingChange={async () => {}}
              onDelete={async () => {}}
            >
              <Button component={Link} to={`/message/${message.id}`} variant="subtle" size="xs">
                View Replies
              </Button>
            </ContentCard>
          </Box>
        ))}
      </Stack>
    );
  };

  const renderUserResults = () => {
    if (!hasSearched || activeTab !== 'users') {
      return null;
    }

    const users = usersData?.searchUsers || [];

    if (users.length === 0) {
      return <Text c="dimmed">No users found matching your search.</Text>;
    }

    return (
      <Stack>
        {users.map((user: any) => (
          <UserCard
            key={user.id}
            id={user.id}
            displayName={user.displayName}
            username={user.username}
            avatar={user.avatar}
            createdAt={user.createdAt}
          />
        ))}
      </Stack>
    );
  };

  const renderResults = () => {
    if (!hasSearched) {
      return (
        <Text c="dimmed" ta="center">
          Enter a search term and click Search to find results.
        </Text>
      );
    }

    if (loading) {
      return <Loader />;
    }

    if (error) {
      return (
        <Alert color="red" title="Error">
          {error.message}
        </Alert>
      );
    }

    switch (activeTab) {
      case 'channels':
        return renderChannelResults();
      case 'messages':
        return renderMessageResults();
      case 'users':
        return renderUserResults();
      default:
        return null;
    }
  };

  const hasResults =
    hasSearched &&
    ((activeTab === 'channels' && channelsData?.searchChannels?.length > 0) ||
      (activeTab === 'messages' && messagesData?.searchMessages?.length > 0) ||
      (activeTab === 'users' && usersData?.searchUsers?.length > 0));

  return (
    <AppShell>
      <Container>
        <Title mb="xl">Search</Title>

        <Paper withBorder p="md" mb="xl">
          <form onSubmit={form.onSubmit(handleSearch)}>
            <Group align="flex-end">
              <TextInput
                label="Search Term"
                placeholder="Enter search term..."
                required
                style={{ flex: 1 }}
                rightSection={loading ? <Loader size="xs" /> : null}
                {...form.getInputProps('searchTerm')}
              />
              <Button type="submit" loading={loading}>
                Search
              </Button>
            </Group>

            <Divider my="md" />

            <Group align="flex-start">
              <Radio.Group
                label="Search In"
                value={activeTab}
                onChange={(value) => handleTabChange(value)}
                name="searchType"
              >
                <Group mt="xs">
                  <Radio value="channels" label="Channels" />
                  <Radio value="messages" label="Messages" />
                  <Radio value="users" label="Users" />
                </Group>
              </Radio.Group>

              <Select
                label="Sort By"
                placeholder="Select sorting option"
                data={[
                  { value: 'recent', label: 'Most Recent' },
                  { value: 'rating', label: 'Highest Rating' },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value || 'recent')}
                style={{ width: 200 }}
              />
            </Group>
          </form>
        </Paper>

        {hasResults && (
          <Title order={3} mb="md">
            Results
          </Title>
        )}

        {renderResults()}
      </Container>
    </AppShell>
  );
}
