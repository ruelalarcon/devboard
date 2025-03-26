import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Button, Card, Group, Modal, Text, Title } from '@mantine/core';
import { formatDate } from '../../utils/dateUtils';
import { AvatarUpload } from '../AvatarUpload';

interface UserCardProps {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  createdAt: string;
  isAdmin?: boolean;
  compact?: boolean;
  withButton?: boolean;
  canEditAvatar?: boolean;
  onAvatarUpdate?: (avatarUrl: string) => Promise<void>;
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
  canEditAvatar = false,
  onAvatarUpdate,
}: UserCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Card withBorder shadow="sm" p={compact ? 'md' : 'lg'} radius="md">
      <Group>
        {canEditAvatar ? (
          <Avatar
            src={avatar}
            radius="xl"
            size={compact ? 'md' : 'lg'}
            color="blue"
            style={{ cursor: 'pointer' }}
            onClick={handleOpenModal}
          >
            {displayName ? displayName.charAt(0).toUpperCase() : '?'}
          </Avatar>
        ) : (
          <Link to={`/user/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Avatar src={avatar} radius="xl" size={compact ? 'md' : 'lg'} color="blue">
              {displayName ? displayName.charAt(0).toUpperCase() : '?'}
            </Avatar>
          </Link>
        )}
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
        <Group ml="auto">
          {canEditAvatar && (
            <Button variant="subtle" size={compact ? 'xs' : 'sm'} onClick={handleOpenModal}>
              Change Avatar
            </Button>
          )}
          {withButton && (
            <Button
              component={Link}
              to={`/user/${id}`}
              variant="outline"
              size={compact ? 'xs' : 'sm'}
            >
              View Profile
            </Button>
          )}
        </Group>
      </Group>

      {canEditAvatar && onAvatarUpdate && (
        <Modal
          opened={modalOpen}
          onClose={handleCloseModal}
          title="Update Your Avatar"
          centered
          size="md"
        >
          <AvatarUpload
            currentAvatar={avatar}
            displayName={displayName}
            onAvatarUploaded={async (imageUrl) => {
              await onAvatarUpdate(imageUrl);
              handleCloseModal();
            }}
          />
        </Modal>
      )}
    </Card>
  );
}
