import React from "react";
import { Box, Flex } from "@chakra-ui/react";

export default function HomeLayout({ children }) {
  return (
    <Flex direction="column" height="100vh" width="100%">
      <Box as="main" flexGrow={1}>
        {children}
      </Box>
    </Flex>
  );
}
