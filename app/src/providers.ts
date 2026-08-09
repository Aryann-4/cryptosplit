import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type MidnightWalletProvider } from './wallet.js';
import { type NetworkConfig } from './config.js';

export type SplitBillCircuits =
  | 'addParticipant'
  | 'finalizeSetup'
  | 'cancel'
  | 'deposit'
  | 'withdraw'
  | 'settle';

export type CryptoSplitCircuits =
  | 'addMember'
  | 'removeMember'
  | 'setNetDebt'
  | 'settle'
  | 'transferOrganizer';

export type SplitBillProviders = MidnightProviders<any>;

export type CryptoSplitProviders = MidnightProviders<any>;

export function buildProviders(
  wallet: MidnightWalletProvider,
  zkConfigPath: string,
  config: NetworkConfig,
  storeSuffix: string = 'split-bill',
): SplitBillProviders {
  const zkConfigProvider = new NodeZkConfigProvider<SplitBillCircuits>(zkConfigPath);
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `${storeSuffix}-${Date.now()}`,
      privateStoragePasswordProvider: () => 'Split-Bill-Test-Password',
      accountId: wallet.getCoinPublicKey(),
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      config.proofServer,
      zkConfigProvider,
    ),
    walletProvider: wallet,
    midnightProvider: wallet,
  };
}

export function buildCryptoSplitProviders(
  wallet: MidnightWalletProvider,
  zkConfigPath: string,
  config: NetworkConfig,
): CryptoSplitProviders {
  const zkConfigProvider = new NodeZkConfigProvider<CryptoSplitCircuits>(zkConfigPath);
  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `cryptosplit-${Date.now()}`,
      privateStoragePasswordProvider: () => 'CryptoSplit-Test-Password',
      accountId: wallet.getCoinPublicKey(),
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      config.proofServer,
      zkConfigProvider,
    ),
    walletProvider: wallet,
    midnightProvider: wallet,
  };
}
