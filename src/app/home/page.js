"use client";
import { Box, Flex, VStack, useToast, Spinner } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ContestList from "@/components/ContestList";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PollCreationForm from "@/components/PollCreationForm";
import SideBar from "@/components/SideBar";
import { useWalletProvider } from "@/context/WalletContext";

const HomePage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingContestsList, setLoadingContestsList] = useState(false);
  const [contestCounts, setContestCounts] = useState(0);
  const toast = useToast();
  const router = useRouter();
  const { selectedSigner, provider, setContests, votingSystemContract } =
    useWalletProvider();

  useEffect(() => {
    if (!selectedSigner || !provider) {
      router.push("/");
    }
  }, [selectedSigner, provider]);

  useEffect(() => {
    const fetchContestCounts = async () => {
      if (votingSystemContract) {
        try {
          const count = await votingSystemContract.pollingContestCount();
          setContestCounts((prevCount) => {
            const newCount = Number(count);
            if (newCount !== prevCount) {
              return newCount;
            }
            return prevCount;
          });
        } catch (error) {
          console.error("Error fetching contest count:", error);
          toast({
            title: "Error",
            description: "Failed to fetch contest count.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    fetchContestCounts();

    const interval = setInterval(fetchContestCounts, 10000);

    return () => clearInterval(interval);
  }, [votingSystemContract]);

  useEffect(() => {
    const fetchContests = async () => {
      if (votingSystemContract && contestCounts > 0) {
        setLoadingContestsList(true);
        try {
          const updatedContests = await Promise.all(
            Array.from({ length: contestCounts }).map(async (_, index) => {
              const candidates = await votingSystemContract.getCandidates(
                index + 1
              );

              const contestDetails = await votingSystemContract.pollingContests(
                index + 1
              );

              const { duration, contestStartTime } = contestDetails;
              const contestEndTime =
                Number(contestStartTime) + Number(duration);

              return {
                candidates,
                duration: Number(duration),
                contestStartTime: Number(contestStartTime).toString(),
                contestEndTime: contestEndTime.toString(),
              };
            })
          );

          setContests(updatedContests);
        } catch (error) {
          console.error("Error fetching contest data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch contest details.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoadingContestsList(false);
        }
      } else {
        setLoadingContestsList(false);
      }
    };

    fetchContests();
  }, [votingSystemContract, contestCounts]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <Flex direction="column" height="100vh" width="100%">
      <Header toggleDrawer={toggleDrawer} />
      <Flex direction="row" flexGrow={1}>
        <SideBar isDrawerOpen={isDrawerOpen} />
        <Box
          as="section"
          flexGrow={1}
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <VStack spacing={4} width="100%" maxWidth="600px">
            <PollCreationForm />
            <Box width="100%" pt={6}>
              {loadingContestsList ? (
                <Flex justify="center" align="center" height="200px">
                  <Spinner size="xl" />
                </Flex>
              ) : (
                <ContestList />
              )}
            </Box>
          </VStack>
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default HomePage;
