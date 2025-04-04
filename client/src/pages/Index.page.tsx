import { Link } from 'react-router-dom';
import { Box, Button, Container, Group, Text, Title, Accordion, List, Code, Divider } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';

export function IndexPage() {
  const { user } = useAuth();

  return (
    <Container size="md" py={40}>
      <Title order={1} ta="center" mt={50} data-cy="title">
        DevBoard
      </Title>
      <Text ta="center" maw={700} mx="auto" mt="xl" size="lg">
        A community platform for discussing programming issues, sharing knowledge, and connecting
        with other developers.
      </Text>

      <Box mt={50} ta="center">
        {user ? (
          <Button component={Link} to="/home" size="lg" data-cy="home-button">
            Go to Home
          </Button>
        ) : (
          <Group justify="center" gap="md">
            <Button component={Link} to="/login" size="lg" variant="filled" data-cy="login-button">
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              size="lg"
              variant="outline"
              data-cy="register-button"
            >
              Register
            </Button>
          </Group>
        )}
      </Box>

      <Divider my={40} />

      <Title order={2} ta="center" mb={20}>
        Platform Features
      </Title>

      <Accordion>
        <Accordion.Item value="channels">
          <Accordion.Control>Channel Management</Accordion.Control>
          <Accordion.Panel>
            <Text>Organize discussions by programming topics with dedicated channels. Join existing channels or create new ones to focus conversations around specific languages, frameworks, or concepts.</Text>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="messages">
          <Accordion.Control>Message & Reply System</Accordion.Control>
          <Accordion.Panel>
            <Text>Post questions or share insights as messages in channels. Community members can provide nested replies to facilitate organized Q&A discussions and detailed problem-solving.</Text>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="ratings">
          <Accordion.Control>Rating System</Accordion.Control>
          <Accordion.Panel>
            <Text>Upvote or downvote content to highlight helpful contributions. This helps the community identify valuable information and recognize knowledgeable members.</Text>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="search">
          <Accordion.Control>Search Functionality</Accordion.Control>
          <Accordion.Panel>
            <Text>Find relevant content quickly with our powerful search. Locate specific messages, topics, or user contributions across all channels and discussions.</Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Title order={2} ta="center" my={30}>
        Text Formatting Guide
      </Title>

      <Box mb={30}>
        <Text fw={500} mb={10}>DevBoard supports markdown-style formatting:</Text>

        <List spacing="xs">
          <List.Item><Text>Bold: <Code>**text**</Code></Text></List.Item>
          <List.Item><Text>Italic: <Code>*text*</Code></Text></List.Item>
          <List.Item><Text>Bold + Italic: <Code>***text***</Code></Text></List.Item>
          <List.Item><Text>Strikethrough: <Code>~~text~~</Code></Text></List.Item>
          <List.Item><Text>Code: <Code>`code`</Code></Text></List.Item>
          <List.Item><Text>Code blocks:<br />
<Code>```language<br />
your code here<br />
```</Code></Text></List.Item>
          <List.Item><Text>Headers: <Code># Header 1</Code> to <Code>###### Header 6</Code></Text></List.Item>
          <List.Item><Text>Blockquotes: <Code>{'>'} quoted text</Code></Text></List.Item>
          <List.Item><Text>Lists: <Code>- list item</Code></Text></List.Item>
          <List.Item><Text>URLs are automatically linked</Text></List.Item>
        </List>
      </Box>
    </Container>
  );
}
