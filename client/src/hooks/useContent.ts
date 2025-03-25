import { useMutation } from '@apollo/client';
import { notifications } from '@mantine/notifications';
import { CREATE_REPLY } from '../graphql/message';

type ContentType = 'message' | 'channel' | 'reply';

interface UseContentProps {
  contentId?: string;
  contentType: ContentType;
  onSuccess?: () => void;
}

export function useContent({ contentId, contentType: _contentType, onSuccess }: UseContentProps) {
  const [createReply, { loading: replyLoading }] = useMutation(CREATE_REPLY);

  const addReply = async (content: string, parentReplyId?: string) => {
    if (!contentId) {
      return;
    }

    try {
      await createReply({
        variables: {
          messageId: contentId,
          content,
          parentReplyId: parentReplyId || undefined,
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

  return {
    addReply,
    replyLoading,
  };
}
