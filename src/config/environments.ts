// src/config/environments.ts
export const ENVIRONMENTS = {
  devnet: {
    gateway: 'https://devnet-gateway.multiversx.com',
    api: 'https://devnet-api.multiversx.com',
    explorer: 'https://devnet-explorer.multiversx.com',
    label: 'Devnet',
  },
  testnet: {
    gateway: 'https://testnet-gateway.multiversx.com',
    api: 'https://testnet-api.multiversx.com',
    explorer: 'https://testnet-explorer.multiversx.com',
    label: 'Testnet',
  },
  mainnet: {
    gateway: 'https://gateway.multiversx.com',
    api: 'https://api.multiversx.com',
    explorer: 'https://explorer.multiversx.com',
    label: 'Mainnet',
  },
};

export type EnvironmentKey = keyof typeof ENVIRONMENTS;

export const DEFAULT_ENVIRONMENT: EnvironmentKey = 'devnet';
