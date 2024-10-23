"use client";
import {
  Button,
  Box,
  Heading,
  Text,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { useWalletProvider } from "../context/WalletContext";
import { useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
require("dotenv").config();

export default function WelcomePage() {
  const toast = useToast();
  const {
    isLoading,
    setIsLoading,
    provider,
    setProvider,
    setSelectedSigner,
    setAccount,
  } = useWalletProvider();
  const router = useRouter();

  const sepoliaNetwork = {
    chainId: "11155111",
    chainName: "Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: [
      `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        setProvider(accounts.length > 0 ? provider : null);
        setAccount(accounts.length > 0 ? accounts[0] : null);
      }
    };

    if (provider !== null) {
      checkWalletConnection();
    }
  }, [provider]);

  const handleConnectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length === 0) {
        throw new Error("No accounts found.");
      }

      const currentChainIdHex = await provider.send("eth_chainId", []);
      const currentChainId = parseInt(currentChainIdHex, 16);

      if (currentChainId !== 11155111) {
        await provider.send("wallet_addEthereumChain", [sepoliaNetwork]);
        await provider.send("eth_requestAccounts", []);
      }

      setProvider(provider);
      const signer = await provider.getSigner(accounts[0]);
      setSelectedSigner(signer);

      router.push("/home");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection Error",
        description:
          error.message || "Failed to connect to the wallet. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box textAlign="center" py={10} px={6}>
      {isLoading ? (
        <Skeleton height="20px" width="200px" />
      ) : (
        <>
          <Heading as="h1" size="xl" mb={4}>
            Welcome to the DApp!
          </Heading>
          <Text fontSize="lg" mb={6}>
            {provider
              ? "Your wallet is connected."
              : "Connect your wallet to get started."}
          </Text>
          <Button colorScheme="teal" onClick={handleConnectWallet} mt={4}>
            {"Connect Wallet"}
          </Button>
        </>
      )}
    </Box>
  );
}
