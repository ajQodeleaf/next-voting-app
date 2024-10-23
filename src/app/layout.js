"use client";
import { ChakraProvider } from "@chakra-ui/react";
import "../styles/globals.css";
import theme from "../styles/theme";
import { WalletProvider } from "@/context/WalletContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider theme={theme}>
          <WalletProvider>{children}</WalletProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
