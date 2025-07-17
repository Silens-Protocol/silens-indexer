import { createConfig } from "ponder";
import { http } from "viem";
import { SilensAbi } from "./abis/SilensAbi";
import { ModelRegistryAbi } from "./abis/ModelRegistryAbi";
import { VotingProposalAbi } from "./abis/VotingProposalAbi";
import { ReputationSystemAbi } from "./abis/ReputationSystemAbi";
import { IdentityRegistryAbi } from "./abis/IdentityRegistryAbi";

export default createConfig({
  chains: {
    scrollSepolia: {
      id: 534351,
      rpc: http("https://sepolia-rpc.scroll.io"),
    },
  },
  contracts: {
    Silens: {
      abi: SilensAbi,
      chain: "scrollSepolia",
      address: "0xead4333D786BAfb96DD2E9F5100f3492a2a3f358",
      startBlock: 10901872,
    },
    ModelRegistry: {
      abi: ModelRegistryAbi,
      chain: "scrollSepolia",
      address: "0xf7beA8B435A228595Dee20dC1bde146eEBDB6a97",
      startBlock: 10901872,
    },
    VotingProposal: {
      abi: VotingProposalAbi,
      chain: "scrollSepolia",
      address: "0x96842cafd37F1F7bdE59ef2dA601320F396589F8",
      startBlock: 10901872,
    },
    ReputationSystem: {
      abi: ReputationSystemAbi,
      chain: "scrollSepolia",
      address: "0x9B7BE371a83179C21debAAFa7038e2210b9Dd08D",
      startBlock: 10901872,
    },
    IdentityRegistry: {
      abi: IdentityRegistryAbi,
      chain: "scrollSepolia",
      address: "0x4092F361c8186865923e7DD217900735f00cb566",
      startBlock: 10901872,
    },
  },
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  }
});