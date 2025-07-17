export const SilensAbi = [
  {
    inputs: [
      { internalType: "address", name: "_modelRegistry", type: "address" },
      { internalType: "address", name: "_reputationSystem", type: "address" },
      { internalType: "address", name: "_proposalVoting", type: "address" },
      { internalType: "address", name: "_identitySystem", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "modelId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "AutoProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "modelRegistry",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "reputationSystem",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "proposalVoting",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "identitySystem",
        type: "address",
      },
    ],
    name: "SystemInitialized",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "_modelId", type: "uint256" }],
    name: "checkAndCreateProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_reviewer", type: "address" }],
    name: "getReviewerIdentityToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_reviewer", type: "address" }],
    name: "hasVerifiedIdentity",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "identitySystem",
    outputs: [
      {
        internalType: "contract SilensIdentityRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "modelRegistry",
    outputs: [
      { internalType: "contract SilensModel", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "modelToProposal",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proposalVoting",
    outputs: [
      { internalType: "contract SilensProposal", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "reputationSystem",
    outputs: [
      { internalType: "contract SilensReputation", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_newIdentity", type: "address" },
    ],
    name: "updateIdentitySystem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_newRegistry", type: "address" },
    ],
    name: "updateModelRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newVoting", type: "address" }],
    name: "updateProposalVoting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_newSystem", type: "address" }],
    name: "updateReputationSystem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;