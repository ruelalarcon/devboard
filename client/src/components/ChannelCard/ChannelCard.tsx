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
      <Title order={compact ? 5 : 4} data-cy="channel-detail-title">
        {name}
      </Title>
    </Link>
  ) : (
    <Title order={compact ? 5 : 4} data-cy="channel-detail-title">
      {name}
    </Title>
  );

  return (
    <Card withBorder shadow="sm" p={compact ? 'md' : 'lg'} radius="md" data-cy="channel-item">
      <Group justify="space-between">
        <div>
          {nameElement}
          {description && (
            <Text
              c={compact ? 'dimmed' : undefined}
              size={compact ? 'sm' : undefined}
              data-cy="channel-detail-description"
            >
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
              data-cy="view-channel-button"
            >
              View Channel
            </Button>
          )}
          {showAdminControls && onDeleteChannel && (
            <Button
              color="red"
              size={compact ? 'xs' : 'sm'}
              onClick={onDeleteChannel}
              data-cy="delete-channel-button"
            >
              Delete Channel
            </Button>
          )}
          {children}
        </Group>
      </Group>
    </Card>
  );
}
