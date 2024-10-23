import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";
import { VOTING_ABI } from "@/utils/votingAbi";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const toast = useToast();
  const [provider, setProvider] = useState(null);
  const [votingSystemContract, setVotingSystemContract] = useState(null);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState(false);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    const fetchContract = async () => {
      if (selectedSigner && !votingSystemContract) {
        try {
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_SEPOLIA_VOTING_SYSTEM_CONTRACT_ADDRESS,
            VOTING_ABI,
            selectedSigner
          );
          setVotingSystemContract(contract);
        } catch (error) {
          console.error("Error initializing contract:", error);
        }
      }
    };

    fetchContract();
  }, [selectedSigner]);

  const createPollingContest = async (duration, candidates) => {
    try {
      setIsLoading(true);
      if (!votingSystemContract) {
        toast({
          title: "Contract Not Found",
          description: "Contract is not deployed or connected.",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        return;
      }

      const tx = await votingSystemContract.createPollingContest(
        duration,
        candidates
      );

      await tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          toast({
            title: "Polling Contest Created",
            description: `Polling contest with duration ${duration} created successfully.`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      });
    } catch (error) {
      console.error("Error creating polling contest:", error);
      toast({
        title: "Transaction Error",
        description: "Failed to create polling contest.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const voteForCandidate = async (pollingId, candidateName) => {
    try {
      setIsLoading(true);

      if (!votingSystemContract) {
        toast({
          title: "Contract Not Found",
          description: "Contract is not deployed or connected.",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        return;
      }

      const tx = await votingSystemContract.vote(pollingId, candidateName);

      await tx.wait().then(async (receipt) => {
        if (receipt && receipt.status == 1) {
          toast({
            title: "Vote Successful",
            description: `You voted for ${candidateName} in contest ${pollingId}.`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      });
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Vote Failed",
        description: "Failed to cast your vote.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        provider,
        setProvider,
        selectedSigner,
        setSelectedSigner,
        isLoading,
        setIsLoading,
        account,
        setAccount,
        contests,
        setContests,
        votingSystemContract,
        setVotingSystemContract,
        createPollingContest,
        voteForCandidate,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletProvider = () => useContext(WalletContext);
