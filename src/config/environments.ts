// src/config/environments.ts
export const ENVIRONMENTS = {
  devnet: {
    gateway: 'https://devnet-gateway.multiversx.com',
    api: 'https://devnet-api.multiversx.com',
    explorer: 'https://devnet-explorer.multiversx.com',
    label: 'Devnet',
    defaultScAddress: 'erd1qqqqqqqqqqqqqpgq209g5ct99dcyjdxetdykgy92yqf0cnxf0qesc2aw9w',
    defaultFuncName: 'getPrintInfoFromHash',
  },
  testnet: {
    gateway: 'https://testnet-gateway.multiversx.com',
    api: 'https://testnet-api.multiversx.com',
    explorer: 'https://testnet-explorer.multiversx.com',
    label: 'Testnet',
    defaultScAddress: 'erd1qqqqqqqqqqqqqpgq8h2t00afvdpu0jm8hhppmsf93etjkljc0qeswvtukn',
    defaultFuncName: 'getPrintInfoFromHash',
  },
  mainnet: {
    gateway: 'https://gateway.multiversx.com',
    api: 'https://api.multiversx.com',
    explorer: 'https://explorer.multiversx.com',
    label: 'Mainnet',
    // Using Testnet values as placeholders for Mainnet as per user request
    defaultScAddress: 'erd1qqqqqqqqqqqqqpgq8h2t00afvdpu0jm8hhppmsf93etjkljc0qeswvtukn',
    defaultFuncName: 'getPrintInfoFromHash',
  },
};

export type EnvironmentKey = keyof typeof ENVIRONMENTS;

// Define a type for the structure of each environment's configuration
export type EnvironmentConfig = typeof ENVIRONMENTS[EnvironmentKey];

export const DEFAULT_ENVIRONMENT: EnvironmentKey = 'devnet';
