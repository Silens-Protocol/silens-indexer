import { createConfig } from "ponder";
import { http } from "viem";
import { SilensAbi } from "./abis/SilensAbi";
import { ModelRegistryAbi } from "./abis/ModelRegistryAbi";
import { VotingProposalAbi } from "./abis/VotingProposalAbi";
import { ReputationSystemAbi } from "./abis/ReputationSystemAbi";
import { IdentityRegistryAbi } from "./abis/IdentityRegistryAbi";

export default createConfig({
  chains: {
    bscTestnet: {
      id: 97,
      rpc: http("https://bsc-testnet-rpc.publicnode.com"),
    },
  },
  contracts: {
    Silens: {
      abi: SilensAbi,
      chain: "bscTestnet",
      address: "0xCA18A11ca8e44c9eef603242Ef3cc92EE8BE12C2",
      startBlock: 58760240,
    },
    ModelRegistry: {
      abi: ModelRegistryAbi,
      chain: "bscTestnet",
      address: "0xEFEE9654334eE89A25021903B01AD840C7494dE2",
      startBlock: 58760240,
    },
    VotingProposal: {
      abi: VotingProposalAbi,
      chain: "bscTestnet",
      address: "0x0e6c055996E02b129B8b4d7cCE9210997e408c7E",
      startBlock: 58760240,
    },
    ReputationSystem: {
      abi: ReputationSystemAbi,
      chain: "bscTestnet",
      address: "0x8C0028B38c492A2F991dD805093C6712344D012F",
      startBlock: 58760240,
    },
    IdentityRegistry: {
      abi: IdentityRegistryAbi,
      chain: "bscTestnet",
      address: "0x5EF386D8aF3b1709C4Ca0404A27E80B2d1206e38",
      startBlock: 58760240,
    },
  },
  database: {
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  }
});