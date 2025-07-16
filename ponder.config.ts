import { createConfig } from "ponder";
import { http } from "viem";
import { SilensCoreAbi } from "./abis/SilensCoreAbi";
import { SilensModelRegistryAbi } from "./abis/SilensModelRegistryAbi";
import { SilensProposalVotingAbi } from "./abis/SilensProposalVotingAbi";
import { SilensReputationSystemAbi } from "./abis/SilensReputationSystemAbi";
import { SilensIdentityAbi } from "./abis/SilensIdentityAbi";

export default createConfig({
  chains: {
    scrollSepolia: {
      id: 534351,
      rpc: http("https://sepolia-rpc.scroll.io"),
    },
  },
  contracts: {
    SilensCore: {
      abi: SilensCoreAbi,
      chain: "scrollSepolia",
      address: "0xd20b657d51174d1B374E43A9C1CB78875349BE09",
      startBlock: 10864140,
    },
    SilensModelRegistry: {
      abi: SilensModelRegistryAbi,
      chain: "scrollSepolia",
      address: "0x3200D5861a8bA6874e81f1B2A03661bBCA1e6665",
      startBlock: 10864140,
    },
    SilensProposalVoting: {
      abi: SilensProposalVotingAbi,
      chain: "scrollSepolia",
      address: "0x8660466fd7683A84cB163e78B73c37846477AC68",
      startBlock: 10864140,
    },
    SilensReputationSystem: {
      abi: SilensReputationSystemAbi,
      chain: "scrollSepolia",
      address: "0xAd6dFe534f3bE9221ceaE8bCD929CCa052D48a6B",
      startBlock: 10864140,
    },
    SilensIdentity: {
      abi: SilensIdentityAbi,
      chain: "scrollSepolia",
      address: "0x87BE019A88fC21e60902453b93f19cc41A81a46F",
      startBlock: 10864140,
    },
  },
  database: {
    kind: "postgres",
    connectionString: "postgresql://postgres:jDDOzUGglWnPraqpzLDjcnkBDglasjqn@crossover.proxy.rlwy.net:21467/railway",
  }
});