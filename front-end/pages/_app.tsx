import { ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme";
import { AppProps } from 'next/app'; // Import AppProps for typing
import React, { useState } from 'react';
import LoginPage from "../components/LoginPage";


function MyApp({ Component, pageProps }: AppProps) {
  const [isLoggedIn, setLoggedIn] = useState(false);

  const handleLogin = (success) => {
    setLoggedIn(success);
  };

  return (
    <ChakraProvider theme={theme}>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Component {...pageProps} />
      )}
    </ChakraProvider>
  );
}

export default MyApp;
