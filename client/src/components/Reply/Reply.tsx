import { useState } from 'react';
import { Box, Button } from '@mantine/core';
import { useUserRatings } from '../../hooks/useUserRatings';
import { ContentCard } from '../ContentCard';
import { ReplyForm } from '../ReplyForm';
import classes from './Reply.module.css';

interface ReplyProps {
  id: string;
  content: string;
  screenshot?: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  positiveRatings: number;
  negativeRatings: number;
  level?: number;
  onReply: (replyId: string) => void;
  onSubmitNestedReply?: (
    content: string,
    parentReplyId: string,
    file: File | null
  ) => Promise<void>;
  children?: React.ReactNode;
}

export function Reply({
  id,
  content,
  screenshot,
  createdAt,
  author,
  positiveRatings,
  negativeRatings,
  level = 0,
  onReply,
  onSubmitNestedReply,
  children,
}: ReplyProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { refetch: refetchRatings } = useUserRatings();

  const handleReplyClick = () => {
    if (onSubmitNestedReply) {
      setShowReplyForm(true);
    } else {
      onReply(id);
    }
  };

  const handleSubmitReply = async (content: string, file: File | null) => {
    if (onSubmitNestedReply) {
      await onSubmitNestedReply(content, id, file);
      setShowReplyForm(false);
    }
  };

  return (
    <Box className={classes.replyContainer}>
      <Box ml={level * 40} className={`${level > 0 ? classes.nestedReply : ''}`}>
        <ContentCard
          id={id}
          content={content}
          screenshot={screenshot}
          createdAt={createdAt}
          author={author}
          positiveRatings={positiveRatings}
          negativeRatings={negativeRatings}
          contentType="reply"
          onRatingChange={refetchRatings}
          variant="secondary"
        >
          <Button variant="subtle" size="xs" onClick={handleReplyClick}>
            Reply
          </Button>
        </ContentCard>

        {showReplyForm && (
          <Box className={classes.replyForm}>
            <ReplyForm
              onSubmit={handleSubmitReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write your reply to this comment..."
            />
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
}
