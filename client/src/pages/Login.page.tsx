import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      password: (value) => (value.length < 1 ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);

    try {
      await login(values.username, values.password);
      navigate('/dashboard');
      notifications.show({
        title: 'Success',
        message: 'You have been logged in successfully',
        color: 'green',
      });
    } catch (error) {
      let message = 'Login failed';
      if (error instanceof Error) {
        message = error.message;
      }
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs" py={40}>
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mt="md" mb={30}>
          Login to Programming Channel
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps('username')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps('password')}
          />

          <Group justify="space-between" mt="lg">
            <Text component={Link} to="/register" size="sm">
              Don't have an account? Register
            </Text>
            <Button type="submit" loading={isLoading}>
              Login
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
