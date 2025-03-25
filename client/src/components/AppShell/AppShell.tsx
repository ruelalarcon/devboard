import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Burger,
  Button,
  Group,
  AppShell as MantineAppShell,
  NavLink,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../contexts/AuthContext';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3}>Programming Channel</Title>
          </Group>
          {user && (
            <Group>
              <Text>Hello, {user.displayName}</Text>
              <Button onClick={handleLogout} variant="outline" color="red" size="sm">
                Logout
              </Button>
            </Group>
          )}
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          component={Link}
          to="/dashboard"
          active={location.pathname === '/dashboard' || location.pathname.startsWith('/channel/')}
          style={{
            borderRadius: '.25rem',
          }}
        />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}
