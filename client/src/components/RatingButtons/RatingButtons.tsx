import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { ActionIcon, Group, Text, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DELETE_RATING, RATE_CONTENT } from '../../graphql/rating';
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
  const [localPositiveCount, setLocalPositiveCount] = useState(positiveCount);
  const [localNegativeCount, setLocalNegativeCount] = useState(negativeCount);

  // Update local counts when prop values change
  useEffect(() => {
    setLocalPositiveCount(positiveCount);
    setLocalNegativeCount(negativeCount);
  }, [positiveCount, negativeCount]);

  const [rateContent, { loading: ratingLoading }] = useMutation(RATE_CONTENT);
  const [deleteRating, { loading: deleteLoading }] = useMutation(DELETE_RATING);
  const isLoading = ratingLoading || deleteLoading;

  const updateRating = async (isPositive: boolean) => {
    if (isLoading) {
      return;
    }

    // Current user rating status
    const hasRated = !!userRating;
    const isSameRating = hasRated && userRating.isPositive === isPositive;

    try {
      // Update local state optimistically
      if (isSameRating) {
        // Remove rating
        if (isPositive) {
          setLocalPositiveCount((prev) => prev - 1);
        } else {
          setLocalNegativeCount((prev) => prev - 1);
        }
      } else if (hasRated) {
        // Change rating type
        setLocalPositiveCount((prev) => prev + (isPositive ? 1 : -1));
        setLocalNegativeCount((prev) => prev + (isPositive ? -1 : 1));
      } else {
        // New rating
        isPositive
          ? setLocalPositiveCount((prev) => prev + 1)
          : setLocalNegativeCount((prev) => prev + 1);
      }

      // API call
      if (isSameRating) {
        await deleteRating({ variables: { contentId, contentType } });
      } else {
        await rateContent({ variables: { contentId, contentType, isPositive } });
      }

      // Refresh data
      await refetch();
      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      // Revert on error
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
          onClick={() => updateRating(true)}
          disabled={isLoading}
          size="sm"
          aria-label="Upvote"
          className={userRating?.isPositive ? classes.activeUpvote : classes.upvote}
          data-cy="upvote-button"
        >
          <span role="img" aria-label="Thumbs up">
            👍
          </span>
        </ActionIcon>
      </Tooltip>
      <Text size="sm" className={classes.ratingCount} data-cy="positive-count">
        {localPositiveCount}
      </Text>

      <Tooltip label={userRating?.isPositive === false ? 'Remove downvote' : 'Downvote'}>
        <ActionIcon
          variant={userRating?.isPositive === false ? 'filled' : 'subtle'}
          color={userRating?.isPositive === false ? 'red' : 'gray'}
          onClick={() => updateRating(false)}
          disabled={isLoading}
          size="sm"
          aria-label="Downvote"
          className={userRating?.isPositive === false ? classes.activeDownvote : classes.downvote}
          data-cy="downvote-button"
        >
          <span role="img" aria-label="Thumbs down">
            👎
          </span>
        </ActionIcon>
      </Tooltip>
      <Text size="sm" className={classes.ratingCount} data-cy="negative-count">
        {localNegativeCount}
      </Text>
    </Group>
  );
}
