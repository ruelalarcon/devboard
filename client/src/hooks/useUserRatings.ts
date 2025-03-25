import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { GET_USER_RATINGS } from '../graphql/rating';

interface UserRating {
  id: string;
  contentId: string;
  contentType: 'message' | 'reply';
  isPositive: boolean;
}

export function useUserRatings() {
  const { user } = useAuth();
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  // Load ratings from storage when component mounts
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const cachedRatings = localStorage.getItem('user_ratings');
        if (cachedRatings) {
          const parsedRatings = JSON.parse(cachedRatings);
          setUserRatings(parsedRatings);
          setLoadedFromCache(true);
        }
      } catch (error) {
        console.error('Error loading ratings from storage:', error);
      }
    };

    if (user) {
      loadFromStorage();
    }
  }, [user]);

  const { data, loading, error, refetch } = useQuery(GET_USER_RATINGS, {
    skip: !user,
    fetchPolicy: 'network-only', // Don't use cache for this query
  });

  // Update ratings when data changes
  useEffect(() => {
    if (data?.me?.ratings) {
      setUserRatings(data.me.ratings);
      // Save to local storage
      try {
        localStorage.setItem('user_ratings', JSON.stringify(data.me.ratings));
      } catch (error) {
        console.error('Error saving ratings to storage:', error);
      }
    }
  }, [data]);

  const getUserRating = useCallback(
    (contentId: string, contentType: 'message' | 'reply') => {
      if (!user) {
        return null;
      }

      return (
        userRatings.find(
          (rating) => rating.contentId === contentId && rating.contentType === contentType
        ) || null
      );
    },
    [userRatings, user]
  );

  // Function to update local ratings after rating action
  const updateLocalRating = useCallback((rating: UserRating | null, isDelete = false) => {
    if (!rating) {
      return;
    }

    setUserRatings((prev) => {
      let newRatings;

      if (isDelete) {
        // Remove the rating
        newRatings = prev.filter(
          (r) => !(r.contentId === rating.contentId && r.contentType === rating.contentType)
        );
      } else {
        // Check if rating already exists
        const exists = prev.some(
          (r) => r.contentId === rating.contentId && r.contentType === rating.contentType
        );

        if (exists) {
          // Update existing rating
          newRatings = prev.map((r) =>
            r.contentId === rating.contentId && r.contentType === rating.contentType ? rating : r
          );
        } else {
          // Add new rating
          newRatings = [...prev, rating];
        }
      }

      // Save to local storage
      try {
        localStorage.setItem('user_ratings', JSON.stringify(newRatings));
      } catch (error) {
        console.error('Error saving ratings to storage:', error);
      }

      return newRatings;
    });
  }, []);

  return {
    userRatings,
    getUserRating,
    updateLocalRating,
    loading: loading && !loadedFromCache,
    error,
    refetch,
  };
}
