import { useEffect, useState, useRef } from "react";
import {
  Box,
  Text,
  Avatar,
  SimpleGrid,
  HStack,
  Progress,
  Button,
  Flex,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  useToast,
} from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import { useWalletProvider } from "@/context/WalletContext";

const VoteCandidateGrid = ({
  candidates,
  selectedCandidate,
  isVoted,
  onVote,
  isPollActive,
}) => (
  <SimpleGrid columns={[1, 2]} spacing={5} mt={4}>
    {candidates.map((candidate) => (
      <Box
        key={candidate}
        border="1px solid"
        borderColor={selectedCandidate === candidate ? "teal.500" : "gray.200"}
        borderRadius="md"
        p={4}
        cursor={isPollActive && !isVoted ? "pointer" : "not-allowed"}
        bg={selectedCandidate === candidate ? "teal.50" : "white"}
        onClick={() => isPollActive && !isVoted && onVote(candidate)}
        _hover={isPollActive && !isVoted ? { bg: "gray.100" } : {}}
        textAlign="center"
      >
        <Avatar name={candidate} size="md" mb={2} bg="teal.500" />
        <Text fontSize="lg" fontWeight="medium" color="black">
          {candidate}
        </Text>
      </Box>
    ))}
  </SimpleGrid>
);

const ContestListItem = ({ item, index }) => {
  const { candidates = [], duration, contestStartTime } = item || {};
  const [timeLeft, setTimeLeft] = useState(Number(duration));
  const [isPollActive, setIsPollActive] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votePercentages, setVotePercentages] = useState({});

  const { votingSystemContract, voteForCandidate } = useWalletProvider();
  const toast = useToast();

  const contestEndTime = Number(contestStartTime) + Number(duration);
  const lastVotedRef = useRef(hasVoted);

  const fetchVotePercentages = async () => {
    const percentages = {};
    for (const candidate of candidates) {
      const votesGarnered = Number(
        await votingSystemContract.getVotes(index + 1, candidate)
      );
      const totalVotes = Number(
        await votingSystemContract.getTotalVotes(index + 1)
      );
      percentages[candidate] =
        totalVotes > 0 ? (votesGarnered / totalVotes) * 100 : 0;
    }
    setVotePercentages(percentages);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = contestEndTime - currentTime;

      if (remainingTime <= 0) {
        setTimeLeft(0);
        setIsPollActive(false);
        clearInterval(interval);
      } else {
        setTimeLeft(remainingTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [contestEndTime]);

  useEffect(() => {
    let interval;

    const checkIfVoted = async () => {
      console.log("CheckIfVoted:- ", hasVoted);
      const voted = await votingSystemContract.hasVoted(index + 1);

      if (voted !== lastVotedRef.current) {
        setHasVoted(voted);
        lastVotedRef.current = voted;
      }
    };

    if (isPollActive) {
      checkIfVoted();
      interval = setInterval(checkIfVoted, 5000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isPollActive, index, votingSystemContract]);

  useEffect(() => {
    if (hasVoted || !isPollActive) {
      fetchVotePercentages();
    }
  }, [hasVoted, isPollActive]);

  const formatRemainingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const formatStartTime = (timestamp) => {
    const date = new Date(timestamp * 1000);

    const dateOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const timeOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString("en-US", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

    return `${formattedDate} ${formattedTime}`;
  };

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const submitVote = async () => {
    if (selectedCandidate) {
      await voteForCandidate(index + 1, selectedCandidate).then(() => {
        setHasVoted(true);
        fetchVotePercentages();
      });
    }
  };

  const getStatusMessage = () => {
    if (!isPollActive) {
      return "Poll Closed";
    } else if (hasVoted) {
      return "You have voted";
    } else {
      return "Voting in progress";
    }
  };

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      _hover={{ backgroundColor: "gray.50" }}
      boxShadow="sm"
      bg="white"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="black">
          Contest Start Time: {formatStartTime(contestStartTime)}
        </Text>
        <Flex alignItems="center">
          <TimeIcon boxSize={5} mr={2} />
          <Text fontSize="sm" color="black">
            {formatRemainingTime(timeLeft)}
          </Text>
        </Flex>
      </Flex>

      <Box flex="2" mt={2}>
        <VoteCandidateGrid
          candidates={candidates}
          selectedCandidate={selectedCandidate}
          isVoted={hasVoted}
          onVote={selectCandidate}
          isPollActive={isPollActive}
        />
      </Box>

      <Box mt={2} textAlign="center">
        {!hasVoted && isPollActive && (
          <Button
            colorScheme="teal"
            onClick={submitVote}
            isDisabled={!selectedCandidate || timeLeft <= 0}
          >
            Submit Vote
          </Button>
        )}
      </Box>

      <Box mt={2} textAlign="center">
        <Text color={isPollActive ? "green.500" : "red.500"}>
          {getStatusMessage()}
        </Text>
      </Box>

      {hasVoted && (
        <Box mt={4}>
          <Text fontSize="md" fontWeight="medium" mb={2} color="black">
            Vote Results:
          </Text>
          {candidates.map((candidate) => (
            <Box key={candidate} mb={2}>
              <HStack justify="space-between">
                <Text color="black">{candidate}</Text>
                <Text color="black">
                  {votePercentages[candidate]?.toFixed(2) || 0}%
                </Text>
              </HStack>
              <Progress
                value={votePercentages[candidate] || 0}
                size="sm"
                colorScheme="teal"
                borderRadius="md"
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  // (
  //   <Card maxW="sm" overflow="hidden" variant={"elevated"}>
  //     <CardHeader p={0}>
  //       <Box
  //         display="flex"
  //         justifyContent="space-between"
  //         alignItems="center"
  //         width="100%"
  //       >
  //         <Box
  //           bg="teal.500"
  //           width="220px"
  //           height="40px"
  //           display="flex"
  //           alignItems="center"
  //           justifyContent="center"
  //           color="white"
  //         >
  //           <Text>{formatStartTime(contestStartTime)}</Text>
  //         </Box>
  //         <Box
  //           bg="orange.500"
  //           width="100px"
  //           height="40px"
  //           display="flex"
  //           alignItems="center"
  //           justifyContent="center"
  //           color="white"
  //         >
  //           <HStack spacing={2}>
  //             <TimeIcon />
  //             <Text> {formatRemainingTime(timeLeft)}</Text>
  //           </HStack>
  //         </Box>
  //       </Box>
  //     </CardHeader>
  //     <CardBody gap="2">
  //       <Image
  //         src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
  //         alt="Green double couch with wooden legs"
  //       />
  //       <Text>
  //         This sofa is perfect for modern tropical spaces, baroque inspired
  //         spaces.
  //       </Text>
  //       <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" mt="2">
  //         $450
  //       </Text>
  //     </CardBody>
  //     <CardFooter gap="2">
  //       <Button variant="solid">Buy now</Button>
  //       <Button variant="ghost">Add to cart</Button>
  //     </CardFooter>
  //   </Card>
  // );
};

export default ContestListItem;
