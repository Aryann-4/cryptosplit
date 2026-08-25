import { useState, useCallback } from 'react';
import '@midnight-ntwrk/dapp-connector-api';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

const NETWORK_ID = 'preprod';
const API_BASE = '/api';

interface MidnightState {
  connected: boolean;
  connecting: boolean;
  address: string | null;
  shieldedAddress: string | null;
  connectedApi: ConnectedAPI | null;
  error: string | null;
}

interface CircuitResult {
  status: 'idle' | 'proving' | 'submitting' | 'success' | 'error';
  txHash: string | null;
  error: string | null;
}

function selectWallet(): InitialAPI | undefined {
  if (typeof window === 'undefined' || !window.midnight) return undefined;
  const wallets = Object.values(window.midnight).filter(
    (w): w is InitialAPI => !!w && typeof w === 'object' && 'connect' in w,
  );
  return wallets[0];
}

export function useMidnight() {
  const [state, setState] = useState<MidnightState>({
    connected: false,
    connecting: false,
    address: null,
    shieldedAddress: null,
    connectedApi: null,
    error: null,
  });

  const [circuitResult, setCircuitResult] = useState<CircuitResult>({
    status: 'idle',
    txHash: null,
    error: null,
  });

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const wallet = selectWallet();
      if (!wallet) {
        throw new Error('No Midnight wallet found. Install the Lace wallet extension.');
      }

      const connectedApi: ConnectedAPI = await wallet.connect(NETWORK_ID);
      const status = await connectedApi.getConnectionStatus();
      if (status.status !== 'connected') {
        throw new Error('Wallet connection was not approved.');
      }

      const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();
      const shielded = await connectedApi.getShieldedAddresses();

      setState({
        connected: true,
        connecting: false,
        address: unshieldedAddress,
        shieldedAddress: shielded.shieldedAddress,
        connectedApi,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        connecting: false,
        error: err instanceof Error ? err.message : 'Failed to connect',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false,
      connecting: false,
      address: null,
      shieldedAddress: null,
      connectedApi: null,
      error: null,
    });
    setCircuitResult({ status: 'idle', txHash: null, error: null });
  }, []);

  const callCircuit = useCallback(async (circuit: string, args: Record<string, unknown>) => {
    setCircuitResult({ status: 'proving', txHash: null, error: null });
    try {
      const response = await fetch(`${API_BASE}/${circuit}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setCircuitResult({
          status: 'success',
          txHash: result.txHash ?? null,
          error: null,
        });
      } else {
        setCircuitResult({
          status: 'error',
          txHash: null,
          error: result.error ?? 'Circuit call failed',
        });
      }
    } catch (err) {
      setCircuitResult({
        status: 'error',
        txHash: null,
        error: err instanceof Error ? err.message : 'Network error',
      });
    }
  }, []);

  const resetCircuit = useCallback(() => {
    setCircuitResult({ status: 'idle', txHash: null, error: null });
  }, []);

  return {
    ...state,
    circuitResult,
    connect,
    disconnect,
    callCircuit,
    resetCircuit,
  };
}
