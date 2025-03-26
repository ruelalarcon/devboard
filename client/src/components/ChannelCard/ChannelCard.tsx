import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Group, Text, Title } from '@mantine/core';
import { formatDate } from '../../utils/dateUtils';

interface ChannelCardProps {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  creator?: {
    id: string;
    displayName: string;
  };
  compact?: boolean;
  withLink?: boolean;
  children?: ReactNode;
  showAdminControls?: boolean;
  onDeleteChannel?: () => void;
}

export function ChannelCard({
  id,
  name,
  description,
  createdAt,
  creator,
  compact = false,
  withLink = true,
  children,
  showAdminControls = false,
  onDeleteChannel,
}: ChannelCardProps) {
  const nameElement = withLink ? (
    <Link to={`/channel/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Title order={compact ? 5 : 4}>{name}</Title>
    </Link>
  ) : (
    <Title order={compact ? 5 : 4}>{name}</Title>
  );

  return (
    <Card withBorder shadow="sm" p={compact ? 'md' : 'lg'} radius="md">
      <Group justify="space-between">
        <div>
          {nameElement}
          {description && (
            <Text c={compact ? 'dimmed' : undefined} size={compact ? 'sm' : undefined}>
              {description}
            </Text>
          )}
          {creator && (
            <Text size="sm" c="dimmed">
              Created by{' '}
              <Link to={`/user/${creator.id}`} style={{ textDecoration: 'none' }}>
                {creator.displayName}
              </Link>{' '}
              on {formatDate(createdAt)}
            </Text>
          )}
          {!creator && (
            <Text size="sm" c="dimmed">
              Created on {formatDate(createdAt)}
            </Text>
          )}
        </div>
        <Group>
          {withLink && !children && (
            <Button
              component={Link}
              to={`/channel/${id}`}
              variant="outline"
              size={compact ? 'xs' : 'sm'}
            >
              View Channel
            </Button>
          )}
          {showAdminControls && onDeleteChannel && (
            <Button color="red" size={compact ? 'xs' : 'sm'} onClick={onDeleteChannel}>
              Delete Channel
            </Button>
          )}
          {children}
        </Group>
      </Group>
    </Card>
  );
}
