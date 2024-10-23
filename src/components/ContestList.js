import React from "react";
import { Box, List, ListItem, useColorModeValue } from "@chakra-ui/react";
import ContestListItem from "./ContestListItem";
import { useWalletProvider } from "@/context/WalletContext";

const ContestList = () => {
  const { contests } = useWalletProvider();

  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={8}>
      <List spacing={3} w="full" maxW="lg">
        {contests.map((contest, index) => {
          return (
            <ListItem key={index} display="flex" justifyContent="center">
              <ContestListItem item={contest} index={index} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default ContestList;
