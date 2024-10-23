// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    struct PollingContest {
        uint duration;
        uint contestStartTime;
        address owner;
        string[] candidates;
        mapping(string => uint) votes;
        mapping(address => bool) voted;
        bool exists;
    }

    mapping(uint => PollingContest) public pollingContests;
    uint public pollingContestCount;

    event PollingContestCreated(
        uint pollingId,
        uint duration,
        uint contestStartTime,
        address owner
    );
    event VoteCast(uint pollingId, string candidate);

    modifier onlyOwner(uint pollingId) {
        require(
            pollingContests[pollingId].owner == msg.sender,
            "Not the owner of this contest."
        );
        _;
    }

    function createPollingContest(
        uint _duration,
        string[] memory _candidates
    ) public {
        require(_candidates.length > 0, "At least one candidate is required.");

        pollingContestCount++;
        uint pollingId = pollingContestCount;

        PollingContest storage newContest = pollingContests[pollingId];
        newContest.duration = _duration;
        newContest.contestStartTime = block.timestamp;
        newContest.owner = msg.sender;
        newContest.exists = true;

        for (uint i = 0; i < _candidates.length; i++) {
            newContest.candidates.push(_candidates[i]);
            newContest.votes[_candidates[i]] = 0;
        }

        emit PollingContestCreated(
            pollingId,
            _duration,
            block.timestamp,
            msg.sender
        );
    }

    function vote(uint pollingId, string memory candidateName) public {
        require(
            pollingContests[pollingId].exists,
            "Polling contest does not exist."
        );
        PollingContest storage contest = pollingContests[pollingId];

        require(!contest.voted[msg.sender], "You have already voted.");

        bool validCandidate = false;
        for (uint i = 0; i < contest.candidates.length; i++) {
            if (
                keccak256(abi.encodePacked(contest.candidates[i])) ==
                keccak256(abi.encodePacked(candidateName))
            ) {
                validCandidate = true;
                break;
            }
        }
        require(
            validCandidate,
            "Candidate does not exist in this polling contest."
        );

        contest.votes[candidateName]++;
        contest.voted[msg.sender] = true;

        emit VoteCast(pollingId, candidateName);
    }

    function hasVoted(uint pollingId) public view returns (bool) {
        require(
            pollingContests[pollingId].exists,
            "Polling contest does not exist."
        );
        return pollingContests[pollingId].voted[msg.sender];
    }

    function getCandidates(
        uint pollingId
    ) public view returns (string[] memory) {
        require(
            pollingContests[pollingId].exists,
            "Polling contest does not exist."
        );
        return pollingContests[pollingId].candidates;
    }

    function getVotes(
        uint pollingId,
        string memory candidateName
    ) public view returns (uint) {
        require(
            pollingContests[pollingId].exists,
            "Polling contest does not exist."
        );
        return pollingContests[pollingId].votes[candidateName];
    }

    function getContestTimeDetails(
        uint pollingId
    ) public view returns (uint contestStartTime, uint duration) {
        require(
            pollingContests[pollingId].exists,
            "Polling contest does not exist."
        );
        PollingContest storage contest = pollingContests[pollingId];
        return (contest.contestStartTime, contest.duration);
    }

    function getTotalVotes(
        uint pollingId
    ) public view returns (uint totalVotes) {
        require(
            pollingContests[pollingId].exists,
            "Polling contest does not exist."
        );
        PollingContest storage contest = pollingContests[pollingId];
        totalVotes = 0;

        for (uint i = 0; i < contest.candidates.length; i++) {
            totalVotes += contest.votes[contest.candidates[i]];
        }
    }

    function getWinner(
        uint pollingId
    ) public view returns (string memory winner) {
        require(
            pollingContests[pollingId].exists,
            "Polling contest does not exist."
        );

        PollingContest storage contest = pollingContests[pollingId];
        uint highestVotes = 0;
        string memory potentialWinner = "";
        bool isTie = false;

        for (uint i = 0; i < contest.candidates.length; i++) {
            string memory candidate = contest.candidates[i];
            uint candidateVotes = contest.votes[candidate];

            if (candidateVotes > highestVotes) {
                highestVotes = candidateVotes;
                potentialWinner = candidate;
                isTie = false;
            } else if (candidateVotes == highestVotes && highestVotes > 0) {
                isTie = true;
            }
        }

        if (highestVotes == 0) {
            return "No votes cast";
        } else if (isTie) {
            return "It's a tie";
        } else {
            return potentialWinner;
        }
    }
}
