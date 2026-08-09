// SplitBill declares no `witness` functions in Compact — organizer and
// participant secrets are passed as ordinary circuit arguments (exactly like
// `ownerSecret` in Midnight's unshielded-token tutorial), not pulled from
// off-chain private state. That keeps the contract private-state-free, so
// the compiled contract is wrapped with `CompiledContract.withVacantWitnesses`
// on the TypeScript side (see src/index.ts) instead of supplying a witnesses
// object here.
//
// This file exists so the private-state type has a single, obvious home if
// you later extend the contract with real witnesses (e.g. to keep a local
// address book of participant secrets instead of asking the caller to pass
// them in every time).

export type SplitBillPrivateState = Record<string, never>;

export const createSplitBillPrivateState = (): SplitBillPrivateState => ({});

export type CryptoSplitPrivateState = Record<string, never>;

export const createCryptoSplitPrivateState = (): CryptoSplitPrivateState => ({});
