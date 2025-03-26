import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
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

function Header({
  user,
  onLogout,
  opened,
  onToggle,
}: {
  user: any;
  onLogout: () => void;
  opened: boolean;
  onToggle: () => void;
}) {
  return (
    <Group justify="space-between">
      <Group>
        <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
        <Box visibleFrom="sm">
          <Link to="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Title order={3}>Programming Channel</Title>
          </Link>
        </Box>
      </Group>
      {user && (
        <Group>
          <Group>
            <Avatar src={user.avatar} size="sm" radius="xl">
              {user.displayName[0]}
            </Avatar>
            <Text>
              Hello,{' '}
              <Link to={`/user/${user.id}`} style={{ textDecoration: 'none' }}>
                {user.displayName}
              </Link>
            </Text>
          </Group>
          <Button onClick={onLogout} variant="outline" color="red" size="sm">
            Logout
          </Button>
        </Group>
      )}
    </Group>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isHomeActive = location.pathname === '/home' || location.pathname.startsWith('/channel/');

  return (
    <MantineAppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header p="md">
        <Header user={user} onLogout={handleLogout} opened={opened} onToggle={toggle} />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p="md">
        <NavLink
          label="Home"
          component={Link}
          to="/home"
          active={isHomeActive}
          style={{
            borderRadius: '.25rem',
          }}
        />
        {user && (
          <NavLink
            label="My Profile"
            component={Link}
            to={`/user/${user.id}`}
            active={location.pathname === `/user/${user.id}`}
            style={{
              borderRadius: '.25rem',
              marginTop: '10px',
            }}
          />
        )}
        <NavLink
          label="Search"
          component={Link}
          to="/search"
          active={location.pathname === '/search'}
          style={{
            borderRadius: '.25rem',
            marginTop: '10px',
          }}
        />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}
