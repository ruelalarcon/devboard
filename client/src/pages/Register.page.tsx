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

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const form = useForm({
    initialValues: {
      username: '',
      displayName: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      displayName: (value) =>
        value.length < 2 ? 'Display name must be at least 2 characters' : null,
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);

    try {
      await register(values.username, values.password, values.displayName);
      navigate('/home');
      notifications.show({
        title: 'Success',
        message: 'Your account has been created successfully',
        color: 'green',
        id: 'register-success',
        'data-cy': 'notification-success',
      });
    } catch (error) {
      let message = 'Registration failed';
      if (error instanceof Error) {
        message = error.message;
      }
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
        id: 'register-error',
        'data-cy': 'notification-error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="xs" py={40}>
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mt="md" mb={30} data-cy="register-title">
          Register for DevBoard
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Username"
            placeholder="Your username"
            required
            data-cy="username-input"
            {...form.getInputProps('username')}
          />
          <TextInput
            label="Display Name"
            placeholder="Your display name"
            required
            mt="md"
            data-cy="display-name-input"
            {...form.getInputProps('displayName')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            data-cy="password-input"
            {...form.getInputProps('password')}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            mt="md"
            data-cy="confirm-password-input"
            {...form.getInputProps('confirmPassword')}
          />

          <Group justify="space-between" mt="lg">
            <Text component={Link} to="/login" size="sm">
              Already have an account? Login
            </Text>
            <Button type="submit" loading={isLoading} data-cy="register-submit-button">
              Register
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}
