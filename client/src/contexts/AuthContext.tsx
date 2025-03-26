import { createContext, ReactNode, useContext, useState } from 'react';
import { ApolloError, gql, useMutation, useQuery } from '@apollo/client';

// GraphQL Queries/Mutations
const CURRENT_USER = gql`
  query CurrentUser {
    me {
      id
      username
      displayName
      avatar
      isAdmin
    }
  }
`;

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      user {
        id
        username
        displayName
        avatar
        isAdmin
      }
    }
  }
`;

const REGISTER = gql`
  mutation Register($username: String!, $password: String!, $displayName: String!) {
    register(username: $username, password: $password, displayName: $displayName) {
      user {
        id
        username
        displayName
        avatar
        isAdmin
      }
    }
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// Types
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: ApolloError | null | undefined;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Get current user
  const {
    loading: queryLoading,
    error,
    refetch,
  } = useQuery(CURRENT_USER, {
    onCompleted: (data: { me: User | null }) => {
      if (data?.me) {
        setUser(data.me);
      }
      if (!authInitialized) {
        setAuthInitialized(true);
      }
    },
    onError: () => {
      if (!authInitialized) {
        setAuthInitialized(true);
      }
    },
    fetchPolicy: 'network-only', // Don't use cache for this query
  });

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const login = async (username: string, password: string) => {
    const { data } = await loginMutation({ variables: { username, password } });
    if (data?.login?.user) {
      setUser(data.login.user);
      // Refresh Apollo cache with current user data
      await refetch();
    }
  };

  // Register mutation
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);
  const register = async (username: string, password: string, displayName: string) => {
    const { data } = await registerMutation({ variables: { username, password, displayName } });
    if (data?.register?.user) {
      setUser(data.register.user);
      // Refresh Apollo cache with current user data
      await refetch();
    }
  };

  // Logout mutation
  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT);
  const logout = async () => {
    await logoutMutation();
    setUser(null);
    // Clear Apollo cache to remove any user-specific data
    await refetch();
  };

  // Combined loading state
  const loading =
    queryLoading || loginLoading || registerLoading || logoutLoading || !authInitialized;

  // Expose the context
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
