import { createConfig } from "ponder";
import { http } from "viem";
import { SilensAbi } from "./abis/SilensAbi";
import { SilensModelAbi } from "./abis/SilensModelAbi";
import { SilensProposalAbi } from "./abis/SilensProposalAbi";
import { SilensReputationAbi } from "./abis/SilensReputationAbi";
import { SilensIdentityRegistryAbi } from "./abis/SilensIdentityRegistryAbi";

export default createConfig({
  chains: {
    scrollSepolia: {
      id: 534351,
      rpc: http("https://sepolia-rpc.scroll.io"),
      disableCache: true,
    },
  },
  contracts: {
    Silens: {
      abi: SilensAbi,
      chain: "scrollSepolia",
      address: "0x4fDf383C1eB910893583398AFa61B497860C670C",
      startBlock: 10898978,
    },
    SilensModel: {
      abi: SilensModelAbi,
      chain: "scrollSepolia",
      address: "0x02e4F622509642351e6767F6D487d999a7ae8E55",
      startBlock: 10898978,
    },
    SilensProposal: {
      abi: SilensProposalAbi,
      chain: "scrollSepolia",
      address: "0xdB8C1Cb80A28eC7fC7Eb65e861b016d82686B626",
      startBlock: 10898978,
    },
    SilensReputation: {
      abi: SilensReputationAbi,
      chain: "scrollSepolia",
      address: "0xE743218b205916e0c0c027dA3Cc1366284514621",
      startBlock: 10898978,
    },
    SilensIdentityRegistry: {
      abi: SilensIdentityRegistryAbi,
      chain: "scrollSepolia",
      address: "0x7b74155177aDe9cCe1a8AaF02D9942eA71809af4",
      startBlock: 10898978,
    },
  },
  database: {
    kind: "postgres",
    connectionString: "postgresql://postgres:QhqkhDYINHmDRVeaGbEeXQSzLkDPPALq@turntable.proxy.rlwy.net:58028/railway"
  }
});