import { Link } from 'react-router-dom';
import { Box, Button, Container, Group, Text, Title } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';

export function IndexPage() {
  const { user } = useAuth();

  return (
    <Container size="md" py={40}>
      <Title order={1} ta="center" mt={50}>
        Programming Channel
      </Title>
      <Text ta="center" maw={700} mx="auto" mt="xl" size="lg">
        A community platform for discussing programming issues, sharing knowledge, and connecting
        with other developers.
      </Text>

      <Box mt={50} ta="center">
        {user ? (
          <Button component={Link} to="/home" size="lg">
            Go to Home
          </Button>
        ) : (
          <Group justify="center" gap="md">
            <Button component={Link} to="/login" size="lg" variant="filled">
              Login
            </Button>
            <Button component={Link} to="/register" size="lg" variant="outline">
              Register
            </Button>
          </Group>
        )}
      </Box>
    </Container>
  );
}
