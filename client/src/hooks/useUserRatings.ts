import { useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { GET_USER_RATINGS } from '../graphql/rating';

export interface UserRating {
  id: string;
  contentId: string;
  contentType: 'message' | 'reply';
  isPositive: boolean;
}

export function useUserRatings() {
  const { user } = useAuth();
  
  const { data, loading, error, refetch } = useQuery(GET_USER_RATINGS, {
    skip: !user,
    fetchPolicy: 'network-only', // Don't use cache for this query to ensure we always have fresh data
  });
  
  // Get all user ratings from the server
  const userRatings = data?.me?.ratings || [];
  
  // Get rating for specific content
  const getUserRating = useCallback(
    (contentId: string, contentType: 'message' | 'reply') => {
      if (!user || !userRatings.length) {
        return null;
      }

      return userRatings.find(
        (rating: UserRating) => 
          rating.contentId === contentId && 
          rating.contentType === contentType
      ) || null;
    },
    [userRatings, user]
  );

  return {
    userRatings,
    getUserRating,
    loading,
    error,
    refetch,
  };
}
