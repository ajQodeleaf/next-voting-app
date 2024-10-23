import React, { useState } from "react";
import {
  NumberInput,
  NumberInputField,
  Button,
  VStack,
  HStack,
  Input,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useWalletProvider } from "@/context/WalletContext";

const PollCreationForm = () => {
  const [duration, setDuration] = useState(0);
  const [candidateNames, setCandidateNames] = useState([""]);
  const { createPollingContest, isLoading } = useWalletProvider();
  const toast = useToast();

  const handleCreatePoll = async () => {
    if (duration > 0 && candidateNames.every((name) => name)) {
      try {
        await createPollingContest(duration, candidateNames).then(() => {
          setDuration(0);
          setCandidateNames([""]);
          console.log("Contest Created");
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create poll.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddCandidate = () => setCandidateNames([...candidateNames, ""]);
  const handleRemoveCandidate = (index) =>
    setCandidateNames(candidateNames.filter((_, i) => i !== index));
  const handleCandidateChange = (index, value) =>
    setCandidateNames(
      candidateNames.map((name, i) => (i === index ? value : name))
    );

  return (
    <VStack spacing={4} width="100%">
      <NumberInput
        min={0}
        value={duration}
        onChange={(value) => setDuration(Number(value))}
        width="100%"
      >
        <NumberInputField placeholder="Duration (in seconds)" />
      </NumberInput>
      {candidateNames.map((name, index) => (
        <HStack key={index} width="100%">
          <Input
            value={name}
            onChange={(e) => handleCandidateChange(index, e.target.value)}
            placeholder={`Candidate ${index + 1}`}
          />
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => handleRemoveCandidate(index)}
            aria-label="Remove candidate"
          />
        </HStack>
      ))}
      <Button
        onClick={handleAddCandidate}
        leftIcon={<AddIcon />}
        colorScheme="blue"
      >
        Add Candidate
      </Button>
      <Button
        onClick={handleCreatePoll}
        colorScheme="blue"
        isLoading={isLoading}
        width="100%"
      >
        Create Poll
      </Button>
    </VStack>
  );
};

export default PollCreationForm;
