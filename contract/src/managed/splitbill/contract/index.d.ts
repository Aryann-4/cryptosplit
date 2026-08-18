import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum BillStatus { SETUP = 0,
                         COLLECTING = 1,
                         FUNDED = 2,
                         SETTLED = 3,
                         CANCELLED = 4
}

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  addParticipant(context: __compactRuntime.CircuitContext<PS>,
                 organizerSecret_0: Uint8Array,
                 participantSecret_0: Uint8Array,
                 share_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeSetup(context: __compactRuntime.CircuitContext<PS>,
                organizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancel(context: __compactRuntime.CircuitContext<PS>,
         organizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          participantSecret_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           participantSecret_0: Uint8Array,
           refundTo_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  addParticipant(context: __compactRuntime.CircuitContext<PS>,
                 organizerSecret_0: Uint8Array,
                 participantSecret_0: Uint8Array,
                 share_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeSetup(context: __compactRuntime.CircuitContext<PS>,
                organizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancel(context: __compactRuntime.CircuitContext<PS>,
         organizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          participantSecret_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           participantSecret_0: Uint8Array,
           refundTo_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  deriveId(secret_0: Uint8Array, domain_0: Uint8Array): Uint8Array;
  participantId(participantSecret_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  deriveId(context: __compactRuntime.CircuitContext<PS>,
           secret_0: Uint8Array,
           domain_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  participantId(context: __compactRuntime.CircuitContext<PS>,
                participantSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  addParticipant(context: __compactRuntime.CircuitContext<PS>,
                 organizerSecret_0: Uint8Array,
                 participantSecret_0: Uint8Array,
                 share_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalizeSetup(context: __compactRuntime.CircuitContext<PS>,
                organizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  cancel(context: __compactRuntime.CircuitContext<PS>,
         organizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deposit(context: __compactRuntime.CircuitContext<PS>,
          participantSecret_0: Uint8Array,
          amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  withdraw(context: __compactRuntime.CircuitContext<PS>,
           participantSecret_0: Uint8Array,
           refundTo_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly status: BillStatus;
  readonly organizer: Uint8Array;
  readonly recipient: { bytes: Uint8Array };
  readonly tokenColor: Uint8Array;
  readonly totalAmount: bigint;
  readonly totalOwed: bigint;
  readonly totalDeposited: bigint;
  readonly participantCount: bigint;
  owed: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  deposited: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               organizerSecret_0: Uint8Array,
               billRecipient_0: { bytes: Uint8Array },
               color_0: Uint8Array,
               total_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
