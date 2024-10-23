import React from "react";
import { Box, Text, Divider } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box as="footer" bg="gray.50" p={4} textAlign="center" borderTopRadius="lg">
      <Divider />
      <Text fontSize="sm" color="gray.600" mt={2}>
        © {new Date().getFullYear()} Voting Contest Inc. All rights reserved.
      </Text>
    </Box>
  );
};

export default Footer;
