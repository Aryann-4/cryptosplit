import { useState, useCallback, useEffect } from 'react';
import '@midnight-ntwrk/dapp-connector-api';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { generateSecret, bytesToHex } from '../crypto.ts';
import type { Group, Member } from '../types.ts';

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  shieldedAddress: string | null;
  coinPublicKeyBytes: Uint8Array | null;
  walletProvider: any | null;
  connectedApi: ConnectedAPI | null;
  networkId: string;
  error: string | null;
}

function listWallets(): InitialAPI[] {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.values(window.midnight).filter(
    (w): w is InitialAPI =>
      !!w && typeof w === 'object' && 'connect' in w,
  );
}

function selectWallet(): InitialAPI | undefined {
  const wallets = listWallets();
  return wallets[0];
}

const NETWORK_ID = 'preprod';

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    connecting: false,
    address: null,
    shieldedAddress: null,
    coinPublicKeyBytes: null,
    walletProvider: null,
    connectedApi: null,
    networkId: NETWORK_ID,
    error: null,
  });

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const wallet = selectWallet();
      if (!wallet) {
        throw new Error('No Midnight wallet found. Please install the Lace wallet extension.');
      }

      const connectedApi: ConnectedAPI = await wallet.connect(NETWORK_ID);
      const connectionStatus = await connectedApi.getConnectionStatus();
      if (connectionStatus.status !== 'connected') {
        throw new Error('Wallet connection was not approved.');
      }

      const addresses = await connectedApi.getUnshieldedAddress();
      const shieldedAddrs = await connectedApi.getShieldedAddresses();

      const address = addresses.unshieldedAddress;
      const shieldedAddress = shieldedAddrs.shieldedAddress;

      const coinPubBytes = new Uint8Array(32);
      const pubStr = shieldedAddrs.shieldedCoinPublicKey;
      if (pubStr) {
        const hexStr = pubStr.length === 64 ? pubStr : bytesToHex(new TextEncoder().encode(pubStr).slice(0, 32));
        for (let i = 0; i < 32; i++) {
          coinPubBytes[i] = parseInt(hexStr.substring(i * 2, i * 2 + 2), 16);
        }
      }

      setState({
        connected: true,
        connecting: false,
        address,
        shieldedAddress,
        coinPublicKeyBytes: coinPubBytes,
        walletProvider: connectedApi,
        connectedApi,
        networkId: NETWORK_ID,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        connecting: false,
        error: err instanceof Error ? err.message : 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnect = useCallback(async () => {
    setState({
      connected: false,
      connecting: false,
      address: null,
      shieldedAddress: null,
      coinPublicKeyBytes: null,
      walletProvider: null,
      connectedApi: null,
      networkId: NETWORK_ID,
      error: null,
    });
  }, [state.connectedApi]);

  return {
    ...state,
    connect,
    disconnect,
  };
}

export function createGroupLocal(
  walletAddress: Uint8Array,
  memberLabels: string[],
): Group {
  const members: Member[] = memberLabels.map((label) => ({
    memberId: generateSecret(),
    label,
    isActive: true,
  }));

  const contractAddress = bytesToHex(generateSecret());

  return {
    contractAddress,
    organizer: walletAddress,
    tokenColor: new Uint8Array(32),
    members,
    createdAt: Date.now(),
  };
}
