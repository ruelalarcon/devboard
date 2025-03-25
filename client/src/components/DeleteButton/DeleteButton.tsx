import { useState } from 'react';
import { Button, Group, Modal, Text } from '@mantine/core';
import { useAuth } from '../../contexts/AuthContext';

interface DeleteButtonProps {
  contentType: 'message' | 'reply';
  authorId: string;
  onDelete: () => Promise<void>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function DeleteButton({ contentType, authorId, onDelete, size = 'xs' }: DeleteButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();

  // Show delete button only if user is admin or is the author
  const canDelete = user?.isAdmin || user?.id === authorId;

  if (!canDelete) {
    return null;
  }

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const contentTypeLabel = contentType === 'message' ? 'message' : 'reply';

  return (
    <>
      <Button variant="subtle" color="red" size={size} onClick={handleDeleteClick}>
        Delete
      </Button>

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Deletion"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete this {contentTypeLabel}? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleConfirmDelete} loading={isDeleting}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
