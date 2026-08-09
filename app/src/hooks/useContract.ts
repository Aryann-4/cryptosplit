import { useState, useCallback } from 'react';
import type { CryptoSplitProviders } from '../providers.ts';
import { CompiledCryptoSplit } from '../contract.ts';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { generateSecret, getMemberId, bytesToHex } from '../crypto.ts';

interface ContractState {
  deploying: boolean;
  loading: boolean;
  error: string | null;
}

export function useContract(providers: CryptoSplitProviders | null) {
  const [state, setState] = useState<ContractState>({
    deploying: false,
    loading: false,
    error: null,
  });

  const deployGroup = useCallback(
    async (tokenColor: Uint8Array): Promise<string | null> => {
      if (!providers) return null;
      setState((s) => ({ ...s, deploying: true, error: null }));
      try {
        const organizerSecret = generateSecret();
        const deployed = await deployContract(providers as any, {
          compiledContract: CompiledCryptoSplit as any,
          privateStateId: `cryptosplit-${Date.now()}`,
          initialPrivateState: {},
          args: [organizerSecret, tokenColor],
        } as any);
        const contractAddress = (deployed as any).deployTxData.public.contractAddress;
        setState((s) => ({ ...s, deploying: false }));
        return contractAddress;
      } catch (err) {
        setState((s) => ({
          ...s,
          deploying: false,
          error: err instanceof Error ? err.message : 'Failed to deploy contract',
        }));
        return null;
      }
    },
    [providers],
  );

  const addMember = useCallback(
    async (contractAddress: string, organizerSecret: Uint8Array, memberSecret: Uint8Array) => {
      if (!providers) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        await submitCallTx(providers as any, {
          compiledContract: CompiledCryptoSplit as any,
          contractAddress,
          privateStateId: `cryptosplit-${Date.now()}`,
          circuitId: 'addMember',
          args: [organizerSecret, memberSecret],
        } as any);
        setState((s) => ({ ...s, loading: false }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to add member',
        }));
      }
    },
    [providers],
  );

  const setNetDebt = useCallback(
    async (
      contractAddress: string,
      organizerSecret: Uint8Array,
      debtorId: Uint8Array,
      creditorId: Uint8Array,
      amount: bigint,
    ) => {
      if (!providers) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        await submitCallTx(providers as any, {
          compiledContract: CompiledCryptoSplit as any,
          contractAddress,
          privateStateId: `cryptosplit-${Date.now()}`,
          circuitId: 'setNetDebt',
          args: [organizerSecret, debtorId, creditorId, amount],
        } as any);
        setState((s) => ({ ...s, loading: false }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to set net debt',
        }));
      }
    },
    [providers],
  );

  const settle = useCallback(
    async (
      contractAddress: string,
      debtorSecret: Uint8Array,
      creditorId: Uint8Array,
      amount: bigint,
      creditorAddress: Uint8Array,
    ) => {
      if (!providers) return;
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        await submitCallTx(providers as any, {
          compiledContract: CompiledCryptoSplit as any,
          contractAddress,
          privateStateId: `cryptosplit-${Date.now()}`,
          circuitId: 'settle',
          args: [debtorSecret, creditorId, amount, { bytes: creditorAddress }],
        } as any);
        setState((s) => ({ ...s, loading: false }));
      } catch (err) {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to settle',
        }));
      }
    },
    [providers],
  );

  return {
    ...state,
    deployGroup,
    addMember,
    setNetDebt,
    settle,
  };
}
