import { useState, useCallback } from 'react';
import { generateSecret, bytesToHex } from '../crypto.ts';
import type { Group, Member } from '../types.ts';

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  coinPublicKeyBytes: Uint8Array | null;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    connected: false,
    connecting: false,
    address: null,
    coinPublicKeyBytes: null,
    error: null,
  });

  const connect = useCallback(async (secret: string) => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      // Generate a deterministic key from the seed string
      const seedBytes = new TextEncoder().encode(secret.padEnd(32, '\0').slice(0, 32));
      const coinPublicKeyBytes = generateSecret();
      // XOR seed with random for deterministic but unique key
      for (let i = 0; i < 32; i++) {
        coinPublicKeyBytes[i] = seedBytes[i] ^ coinPublicKeyBytes[i];
      }

      const addressHex = bytesToHex(coinPublicKeyBytes);

      setState({
        connected: true,
        connecting: false,
        address: addressHex,
        coinPublicKeyBytes,
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

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      connecting: false,
      address: null,
      coinPublicKeyBytes: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
}

// Helper to create a group locally (will be replaced by contract interaction)
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
