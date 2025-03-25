import { ApolloProvider } from '@apollo/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { AuthProvider } from './contexts/AuthContext';
import { client } from './lib/apolloClient';
import { AppRouter } from './Router';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <MantineProvider>
        <Notifications />
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </MantineProvider>
    </ApolloProvider>
  );
}
