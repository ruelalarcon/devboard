import { useState } from 'react';
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
  userRating?: {
    id: string;
    isPositive: boolean;
  } | null;
  onRatingChange?: () => void;
}

export function RatingButtons({
  contentId,
  contentType,
  positiveCount,
  negativeCount,
  userRating,
  onRatingChange,
}: RatingButtonsProps) {
  const [localPositiveCount, setLocalPositiveCount] = useState(positiveCount);
  const [localNegativeCount, setLocalNegativeCount] = useState(negativeCount);
  const [localUserRating, setLocalUserRating] = useState(userRating);

  const { updateLocalRating } = useUserRatings();

  const [rateContent, { loading: ratingLoading }] = useMutation(RATE_CONTENT);
  const [deleteRating, { loading: deleteLoading }] = useMutation(DELETE_RATING);

  const isLoading = ratingLoading || deleteLoading;

  const handleUpvote = async () => {
    if (isLoading) {
      return;
    }

    try {
      // If user already upvoted, delete the rating
      if (localUserRating && localUserRating.isPositive) {
        await deleteRating({
          variables: {
            contentId,
            contentType,
          },
        });
        setLocalUserRating(null);
        setLocalPositiveCount((prev) => prev - 1);

        // Update local cache
        updateLocalRating(
          {
            id: localUserRating.id,
            contentId,
            contentType,
            isPositive: true,
          },
          true
        );
      }
      // If user already downvoted, change to upvote
      else if (localUserRating && !localUserRating.isPositive) {
        const { data } = await rateContent({
          variables: {
            contentId,
            contentType,
            isPositive: true,
          },
        });
        setLocalUserRating({ id: data.rateContent.id, isPositive: true });
        setLocalPositiveCount((prev) => prev + 1);
        setLocalNegativeCount((prev) => prev - 1);

        // Update local cache
        updateLocalRating({
          id: data.rateContent.id,
          contentId,
          contentType,
          isPositive: true,
        });
      }
      // If user hasn't rated yet, create an upvote
      else {
        const { data } = await rateContent({
          variables: {
            contentId,
            contentType,
            isPositive: true,
          },
        });
        setLocalUserRating({
          id: data.rateContent.id,
          isPositive: data.rateContent.isPositive,
        });
        setLocalPositiveCount((prev) => prev + 1);

        // Update local cache
        updateLocalRating({
          id: data.rateContent.id,
          contentId,
          contentType,
          isPositive: true,
        });
      }

      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
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
      // If user already downvoted, delete the rating
      if (localUserRating && !localUserRating.isPositive) {
        await deleteRating({
          variables: {
            contentId,
            contentType,
          },
        });
        setLocalUserRating(null);
        setLocalNegativeCount((prev) => prev - 1);

        // Update local cache
        updateLocalRating(
          {
            id: localUserRating.id,
            contentId,
            contentType,
            isPositive: false,
          },
          true
        );
      }
      // If user already upvoted, change to downvote
      else if (localUserRating && localUserRating.isPositive) {
        const { data } = await rateContent({
          variables: {
            contentId,
            contentType,
            isPositive: false,
          },
        });
        setLocalUserRating({ id: data.rateContent.id, isPositive: false });
        setLocalPositiveCount((prev) => prev - 1);
        setLocalNegativeCount((prev) => prev + 1);

        // Update local cache
        updateLocalRating({
          id: data.rateContent.id,
          contentId,
          contentType,
          isPositive: false,
        });
      }
      // If user hasn't rated yet, create a downvote
      else {
        const { data } = await rateContent({
          variables: {
            contentId,
            contentType,
            isPositive: false,
          },
        });
        setLocalUserRating({
          id: data.rateContent.id,
          isPositive: data.rateContent.isPositive,
        });
        setLocalNegativeCount((prev) => prev + 1);

        // Update local cache
        updateLocalRating({
          id: data.rateContent.id,
          contentId,
          contentType,
          isPositive: false,
        });
      }

      if (onRatingChange) {
        onRatingChange();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to rate content',
        color: 'red',
      });
    }
  };

  // Use localUserRating if available, otherwise use prop
  const effectiveUserRating = localUserRating ?? userRating;

  return (
    <Group gap="xs" className={classes.ratingContainer}>
      <Tooltip label={effectiveUserRating?.isPositive ? 'Remove upvote' : 'Upvote'}>
        <ActionIcon
          variant={effectiveUserRating?.isPositive ? 'filled' : 'subtle'}
          color={effectiveUserRating?.isPositive ? 'blue' : 'gray'}
          onClick={handleUpvote}
          disabled={isLoading}
          size="sm"
          aria-label="Upvote"
          className={effectiveUserRating?.isPositive ? classes.activeUpvote : classes.upvote}
        >
          <span role="img" aria-label="Thumbs up">
            👍
          </span>
        </ActionIcon>
      </Tooltip>
      <Text size="sm" className={classes.ratingCount}>
        {localPositiveCount}
      </Text>

      <Tooltip label={effectiveUserRating?.isPositive === false ? 'Remove downvote' : 'Downvote'}>
        <ActionIcon
          variant={effectiveUserRating?.isPositive === false ? 'filled' : 'subtle'}
          color={effectiveUserRating?.isPositive === false ? 'red' : 'gray'}
          onClick={handleDownvote}
          disabled={isLoading}
          size="sm"
          aria-label="Downvote"
          className={
            effectiveUserRating?.isPositive === false ? classes.activeDownvote : classes.downvote
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
