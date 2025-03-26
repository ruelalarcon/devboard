import { Link } from 'react-router-dom';
import { Avatar, Button, Card, Group, Text, Title } from '@mantine/core';
import { formatDate } from '../../utils/dateUtils';

interface UserCardProps {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  createdAt: string;
  isAdmin?: boolean;
  compact?: boolean;
  withButton?: boolean;
}

export function UserCard({
  id,
  displayName,
  username,
  avatar,
  createdAt,
  isAdmin = false,
  compact = false,
  withButton = true,
}: UserCardProps) {
  return (
    <Card withBorder shadow="sm" p={compact ? 'md' : 'lg'} radius="md">
      <Group>
        <Link to={`/user/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Avatar src={avatar} radius="xl" size={compact ? 'md' : 'lg'} color="blue">
            {displayName ? displayName.charAt(0).toUpperCase() : '?'}
          </Avatar>
        </Link>
        <div>
          <Link to={`/user/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Title order={compact ? 5 : 4}>{displayName}</Title>
            <Text size="sm" c="dimmed">
              @{username}
            </Text>
          </Link>
          <Text size="sm" c="dimmed">
            Joined on {formatDate(createdAt)}
          </Text>
          {isAdmin && (
            <Text size="sm" c="blue" fw={500}>
              Administrator
            </Text>
          )}
        </div>
        {withButton && (
          <Button
            component={Link}
            to={`/user/${id}`}
            ml="auto"
            variant="outline"
            size={compact ? 'xs' : 'sm'}
          >
            View Profile
          </Button>
        )}
      </Group>
    </Card>
  );
}
