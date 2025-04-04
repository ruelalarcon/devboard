import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { notifications } from '@mantine/notifications';

// Error handling link to better handle authentication errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(
      ({ message: _message, locations: _locations, path: _path, extensions }) => {
        // Handle authentication errors
        if (extensions?.code === 'UNAUTHENTICATED' && window.location.pathname !== '/login') {
          notifications.show({
            title: 'Authentication Error',
            message: 'Your session has expired. Please log in again.',
            color: 'red',
          });
        }
      }
    );
  }

  if (networkError) {
    notifications.show({
      title: 'Network Error',
      message: 'Unable to connect to the server',
      color: 'red',
    });
  }
});

const httpLink = createHttpLink({
  uri: '/graphql',
  credentials: 'include', // For cookies/sessions
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});
