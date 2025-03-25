import { useMutation } from '@apollo/client';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { RATE_CONTENT, DELETE_RATING } from '../../graphql/rating';
import { useUserRatings } from '../../hooks/useUserRatings';
import classes from './RatingButtons.module.css';

interface RatingButtonsProps {
  contentId: string;
  contentType: 'message' | 'reply';
  positiveCount: number;
  negativeCount: number;
  onRatingChange?: () => void;
}

export function RatingButtons({
  contentId,
  contentType,
  positiveCount,
  negativeCount,
  onRatingChange,
}: RatingButtonsProps) {
  const { getUserRating, refetch } = useUserRatings();
  const userRating = getUserRating(contentId, contentType);
  
  // Local state to track counts for immediate UI updates
  const [localPositiveCount, setLocalPositiveCount] = useState(positiveCount);
  const [localNegativeCount, setLocalNegativeCount] = useState(negativeCount);
  
  // Update local counts when prop values change (e.g. from parent rerender)
  useEffect(() => {
    setLocalPositiveCount(positiveCount);
    setLocalNegativeCount(negativeCount);
  }, [positiveCount, negativeCount]);

  const [rateContent, { loading: ratingLoading }] = useMutation(RATE_CONTENT);
  const [deleteRating, { loading: deleteLoading }] = useMutation(DELETE_RATING);

  const isLoading = ratingLoading || deleteLoading;

  const handleUpvote = async () => {
    if (isLoading) {
      return;
    }

    try {
      // Optimistically update UI before server responds
      if (userRating && userRating.isPositive) {
        // Removing upvote
        setLocalPositiveCount(prev => prev - 1);
      } else if (userRating && !userRating.isPositive) {
        // Switching from downvote to upvote
        setLocalPositiveCount(prev => prev + 1);
        setLocalNegativeCount(prev => prev - 1);
      } else {
        // Adding new upvote
        setLocalPositiveCount(prev => prev + 1);
      }

      // If user already upvoted, delete the rating
      if (userRating && userRating.isPositive) {
        await deleteRating({
          variables: {
            contentId,
            contentType,
          },
        });
      }
      // If user already downvoted or hasn't voted, create/update to upvote
      else {
        await rateContent({
          variables: {
            contentId,
            contentType,
            isPositive: true,
          },
        });
      }

      // Refresh ratings from server
      await refetch();

      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalPositiveCount(positiveCount);
      setLocalNegativeCount(negativeCount);
      
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to rate content',
        color: 'red',
      });
    }
  };

  const handleDownvote = async () => {
    if (isLoading) {
      return;
    }

    try {
      // Optimistically update UI before server responds
      if (userRating && !userRating.isPositive) {
        // Removing downvote
        setLocalNegativeCount(prev => prev - 1);
      } else if (userRating && userRating.isPositive) {
        // Switching from upvote to downvote
        setLocalPositiveCount(prev => prev - 1);
        setLocalNegativeCount(prev => prev + 1);
      } else {
        // Adding new downvote
        setLocalNegativeCount(prev => prev + 1);
      }

      // If user already downvoted, delete the rating
      if (userRating && !userRating.isPositive) {
        await deleteRating({
          variables: {
            contentId,
            contentType,
          },
        });
      }
      // If user already upvoted or hasn't voted, create/update to downvote
      else {
        await rateContent({
          variables: {
            contentId,
            contentType,
            isPositive: false,
          },
        });
      }

      // Refresh ratings from server
      await refetch();

      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalPositiveCount(positiveCount);
      setLocalNegativeCount(negativeCount);
      
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to rate content',
        color: 'red',
      });
    }
  };

  return (
    <Group gap="xs" className={classes.ratingContainer}>
      <Tooltip label={userRating?.isPositive ? 'Remove upvote' : 'Upvote'}>
        <ActionIcon
          variant={userRating?.isPositive ? 'filled' : 'subtle'}
          color={userRating?.isPositive ? 'blue' : 'gray'}
          onClick={handleUpvote}
          disabled={isLoading}
          size="sm"
          aria-label="Upvote"
          className={userRating?.isPositive ? classes.activeUpvote : classes.upvote}
        >
          <span role="img" aria-label="Thumbs up">
            👍
          </span>
        </ActionIcon>
      </Tooltip>
      <Text size="sm" className={classes.ratingCount}>
        {localPositiveCount}
      </Text>

      <Tooltip label={userRating?.isPositive === false ? 'Remove downvote' : 'Downvote'}>
        <ActionIcon
          variant={userRating?.isPositive === false ? 'filled' : 'subtle'}
          color={userRating?.isPositive === false ? 'red' : 'gray'}
          onClick={handleDownvote}
          disabled={isLoading}
          size="sm"
          aria-label="Downvote"
          className={
            userRating?.isPositive === false ? classes.activeDownvote : classes.downvote
          }
        >
          <span role="img" aria-label="Thumbs down">
            👎
          </span>
        </ActionIcon>
      </Tooltip>
      <Text size="sm" className={classes.ratingCount}>
        {localNegativeCount}
      </Text>
    </Group>
  );
}
