"use client";
import React from "react";
import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { SunIcon, ViewIcon, SettingsIcon } from "@chakra-ui/icons";

const SideBar = ({ isDrawerOpen }) => {
  return (
    <Box
      as="nav"
      bg="gray.800"
      color="white"
      width={isDrawerOpen ? "250px" : "80px"}
      transition="width 0.3s ease"
      height="100vh"
      position="fixed"
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="space-between"
        p={4}
        h="100%"
      >
        <Flex direction="column" w="100%">
          <NavItem icon={SunIcon} label="Home" isDrawerOpen={isDrawerOpen} />
          <NavItem
            icon={ViewIcon}
            label="Dashboard"
            isDrawerOpen={isDrawerOpen}
          />
          <NavItem
            icon={SettingsIcon}
            label="Settings"
            isDrawerOpen={isDrawerOpen}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

const NavItem = ({ icon, label, isDrawerOpen }) => {
  return (
    <Flex
      alignItems="center"
      justifyContent={isDrawerOpen ? "flex-start" : "center"}
      width="100%"
      mb={4}
      px={isDrawerOpen ? 2 : 4}
      py={2}
      cursor="pointer"
      _hover={{ bg: "gray.700", borderRadius: "md" }}
    >
      <Icon as={icon} boxSize={6} mr={isDrawerOpen ? 4 : 0} />
      {isDrawerOpen && <Text>{label}</Text>}
    </Flex>
  );
};

export default SideBar;
