
export type EasyCelestiaChain = 'mainnet' | 'mocha'

export interface EasyCelestiaOptions {
  nodeEndpoint: string
  nodeApiKey: string
  network?: EasyCelestiaChain
  rpcEndpoint?: string
  celeniumEndpoint?: string
  celeniumApiKey?: string
}