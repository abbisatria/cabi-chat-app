import './App.css';
import { useAuth0 } from '@auth0/auth0-react';
import Main from './pages/Main';
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { useState } from 'react';
import { RecoilRoot } from 'recoil';
import Loading from './components/Loading';

function App() {

  const { loginWithRedirect, getIdTokenClaims, isAuthenticated, isLoading } = useAuth0();
  const [token, setToken] = useState('');

  if (isLoading) {
    return <Loading />
  }

  getIdTokenClaims().then(res => {
    if (res) {
      setToken(res.__raw);
    }
  })


  const wsLink = new WebSocketLink({
    uri: process.env.REACT_APP_GRAPHQL_WEBSOCKET,
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
    },
  });
  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  });
  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local cookie if it exists
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([authLink, splitLink]),
  });

  return (
    <ApolloProvider client={client}>
      {isAuthenticated ? (
        <RecoilRoot>
          <Main />
        </RecoilRoot>
      ) : (
        loginWithRedirect()
      )}
    </ApolloProvider>
  );
}

export default App;
