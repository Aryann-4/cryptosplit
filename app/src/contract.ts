import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import path from 'node:path';

export { Contract, ledger, type Ledger, BillStatus } from '@split-bill/contract';
import { Contract as SplitBillContract } from '@split-bill/contract';
import { Contract as CryptoSplitContract } from '@split-bill/contract';

const currentDir = path.resolve(new URL(import.meta.url).pathname, '..');

export const zkConfigPath = path.resolve(
  currentDir,
  '..',
  '..',
  'contract',
  'dist',
  'managed',
  'splitbill',
);

export const cryptoSplitZkConfigPath = path.resolve(
  currentDir,
  '..',
  '..',
  'contract',
  'dist',
  'managed',
  'cryptosplit',
);

export const CompiledSplitBill = CompiledContract.make(
  'SplitBill',
  SplitBillContract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

export const CompiledCryptoSplit = CompiledContract.make(
  'CryptoSplit',
  CryptoSplitContract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(cryptoSplitZkConfigPath),
);
