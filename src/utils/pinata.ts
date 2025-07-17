import { PinataSDK } from "pinata";

if (!process.env.PINATA_JWT) {
    throw new Error("PINATA_JWT environment variable is not set");
}

if (!process.env.PINATA_GATEWAY) {
    throw new Error("PINATA_GATEWAY environment variable is not set");
}

export const pinataClient = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY,
    pinataGatewayKey: process.env.PINATA_GATEWAY_KEY
});

export const getIPFSData = async (hash: string) => {
    try {
      const result = await pinataClient.gateways.public.get(hash)
      return result
    } catch (error) {
      console.error('Error fetching IPFS data:', error)
      return null
    }
}

export const getIPFSImageUrl = async (hash: string) => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
}