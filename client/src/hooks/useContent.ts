import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { CREATE_MESSAGE, CREATE_REPLY, DELETE_MESSAGE, DELETE_REPLY } from '../graphql/message';

type ContentType = 'message' | 'channel' | 'reply';

interface UseContentProps {
  contentId?: string;
  contentType: ContentType;
  onSuccess?: () => void;
}

export function useContent({ contentId, contentType: _contentType, onSuccess }: UseContentProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [createReply, { loading: replyLoading }] = useMutation(CREATE_REPLY);
  const [createMessage, { loading: messageLoading }] = useMutation(CREATE_MESSAGE);
  const [deleteMessage, { loading: deleteMessageLoading }] = useMutation(DELETE_MESSAGE);
  const [deleteReply, { loading: deleteReplyLoading }] = useMutation(DELETE_REPLY);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!file) {
      return null;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: 'Error',
        message: 'File size must be less than 5MB',
        color: 'red',
      });
      return null;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      notifications.show({
        title: 'Error',
        message: 'Only image files (JPEG, PNG, GIF, WEBP) are allowed',
        color: 'red',
      });
      return null;
    }

    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      const serverUrl = 'http://localhost:4000';
      const imageUrl = `${serverUrl}${data.file.url}`;

      return imageUrl;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload image',
        color: 'red',
      });
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  const addReply = async (content: string, file?: File | null, parentReplyId?: string) => {
    if (!contentId) {
      return false;
    }

    try {
      let screenshot = undefined;

      // If there's a file, upload it first
      if (file) {
        const imageUrl = await uploadFile(file);
        if (imageUrl) {
          screenshot = imageUrl;
        }
      }

      await createReply({
        variables: {
          messageId: contentId,
          content,
          parentReplyId: parentReplyId || undefined,
          screenshot,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Reply posted successfully',
        color: 'green',
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to post reply',
        color: 'red',
      });

      return false;
    }
  };

  const addMessage = async (channelId: string, content: string, file?: File | null) => {
    try {
      let screenshot = undefined;

      // If there's a file, upload it first
      if (file) {
        const imageUrl = await uploadFile(file);
        if (imageUrl) {
          screenshot = imageUrl;
        }
      }

      await createMessage({
        variables: {
          channelId,
          content,
          screenshot,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Message posted successfully',
        color: 'green',
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to post message',
        color: 'red',
      });

      return false;
    }
  };

  const removeMessage = async (messageId: string) => {
    try {
      await deleteMessage({
        variables: {
          id: messageId,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Message deleted successfully',
        color: 'green',
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete message',
        color: 'red',
      });

      return false;
    }
  };

  const removeReply = async (replyId: string) => {
    try {
      await deleteReply({
        variables: {
          id: replyId,
        },
      });

      notifications.show({
        title: 'Success',
        message: 'Reply deleted successfully',
        color: 'green',
      });

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete reply',
        color: 'red',
      });

      return false;
    }
  };

  return {
    addReply,
    addMessage,
    removeMessage,
    removeReply,
    isLoading:
      replyLoading || messageLoading || uploadLoading || deleteMessageLoading || deleteReplyLoading,
  };
}
