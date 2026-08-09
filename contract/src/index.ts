import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

export * from './managed/splitbill/contract/index.js';
export * from './witnesses.js';

import * as SplitBillTypes from './managed/splitbill/contract/index.js';
import * as CryptoSplitTypes from './managed/cryptosplit/contract/index.js';

// Re-export CryptoSplit pure circuits with a namespace prefix
export const CryptoSplitPureCircuits = CryptoSplitTypes.pureCircuits;
export type CryptoSplitLedger = CryptoSplitTypes.Ledger;
export const cryptoSplitLedger = CryptoSplitTypes.ledger;

export const CompiledSplitBillContract = CompiledContract.make<
  SplitBillTypes.Contract<Record<string, never>>
>('SplitBill', SplitBillTypes.Contract<Record<string, never>>).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets('./managed/splitbill'),
);

export const CompiledCryptoSplitContract = CompiledContract.make<
  CryptoSplitTypes.Contract<Record<string, never>>
>('CryptoSplit', CryptoSplitTypes.Contract<Record<string, never>>).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets('./managed/cryptosplit'),
);
