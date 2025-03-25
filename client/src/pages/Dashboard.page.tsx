import { useNavigate } from 'react-router-dom';
import { Button, Container, Group, Text, Title } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Container py={40}>
      <Group justify="space-between" mb={30}>
        <Title>Dashboard</Title>
        <Button onClick={handleLogout} variant="outline" color="red">
          Logout
        </Button>
      </Group>

      <Text>Hello, {user?.displayName}! Welcome to your dashboard.</Text>
    </Container>
  );
}
