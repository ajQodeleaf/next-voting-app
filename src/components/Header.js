"use client";
import React from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Text,
  IconButton,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useWalletProvider } from "@/context/WalletContext";
import { useRouter } from "next/navigation";

const Header = ({ toggleDrawer }) => {
  const toast = useToast();
  const { account, setProvider } = useWalletProvider();
  const router = useRouter();

  const bgColor = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("gray.800", "gray.200");
  const accountColor = useColorModeValue("gray.600", "gray.400");
  const iconColor = useColorModeValue("gray.800", "gray.200");

  const handleDisconnectWallet = () => {
    setProvider(null);
    toast({
      title: "Disconnected",
      description: "You have disconnected your wallet.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
    router.push("/");
  };

  return (
    <Box
      as="header"
      bg={bgColor}
      boxShadow="sm"
      h={"64px"}
      borderBottom={"1px gray solid"}
    >
      <Flex align="center" justify="space-between" h="100%" px={4}>
        <Flex align="center" h="100%">
          <IconButton
            icon={<HamburgerIcon />}
            aria-label="Open Menu"
            onClick={toggleDrawer}
            variant="ghost"
            size="lg"
            mr={4}
            borderRadius="full"
            color={iconColor}
          />
          <Heading size="md" color={headingColor} mr={4}>
            Voting Contest
          </Heading>
          {account && (
            <Text fontSize="sm" color={accountColor} isTruncated>
              {account.address}
            </Text>
          )}
        </Flex>

        <Button
          colorScheme="teal"
          variant="solid"
          onClick={handleDisconnectWallet}
          size="md"
          borderRadius="full"
        >
          Disconnect Wallet
        </Button>
      </Flex>
    </Box>
  );
};

export default Header;
