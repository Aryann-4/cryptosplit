import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  addMember(context: __compactRuntime.CircuitContext<PS>,
            organizerSecret_0: Uint8Array,
            memberSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  removeMember(context: __compactRuntime.CircuitContext<PS>,
               organizerSecret_0: Uint8Array,
               targetMemberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setNetDebt(context: __compactRuntime.CircuitContext<PS>,
             organizerSecret_0: Uint8Array,
             debtorId_0: Uint8Array,
             creditorId_0: Uint8Array,
             amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>,
         debtorSecret_0: Uint8Array,
         creditorId_0: Uint8Array,
         amount_0: bigint,
         creditorAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  transferOrganizer(context: __compactRuntime.CircuitContext<PS>,
                    organizerSecret_0: Uint8Array,
                    newOrganizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  addMember(context: __compactRuntime.CircuitContext<PS>,
            organizerSecret_0: Uint8Array,
            memberSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  removeMember(context: __compactRuntime.CircuitContext<PS>,
               organizerSecret_0: Uint8Array,
               targetMemberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setNetDebt(context: __compactRuntime.CircuitContext<PS>,
             organizerSecret_0: Uint8Array,
             debtorId_0: Uint8Array,
             creditorId_0: Uint8Array,
             amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>,
         debtorSecret_0: Uint8Array,
         creditorId_0: Uint8Array,
         amount_0: bigint,
         creditorAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  transferOrganizer(context: __compactRuntime.CircuitContext<PS>,
                    organizerSecret_0: Uint8Array,
                    newOrganizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  deriveId(secret_0: Uint8Array, domain_0: Uint8Array): Uint8Array;
  memberId(secret_0: Uint8Array): Uint8Array;
  debtKey(debtorId_0: Uint8Array, creditorId_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  deriveId(context: __compactRuntime.CircuitContext<PS>,
           secret_0: Uint8Array,
           domain_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  memberId(context: __compactRuntime.CircuitContext<PS>, secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  debtKey(context: __compactRuntime.CircuitContext<PS>,
          debtorId_0: Uint8Array,
          creditorId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  addMember(context: __compactRuntime.CircuitContext<PS>,
            organizerSecret_0: Uint8Array,
            memberSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  removeMember(context: __compactRuntime.CircuitContext<PS>,
               organizerSecret_0: Uint8Array,
               targetMemberId_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  setNetDebt(context: __compactRuntime.CircuitContext<PS>,
             organizerSecret_0: Uint8Array,
             debtorId_0: Uint8Array,
             creditorId_0: Uint8Array,
             amount_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  settle(context: __compactRuntime.CircuitContext<PS>,
         debtorSecret_0: Uint8Array,
         creditorId_0: Uint8Array,
         amount_0: bigint,
         creditorAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  transferOrganizer(context: __compactRuntime.CircuitContext<PS>,
                    organizerSecret_0: Uint8Array,
                    newOrganizerSecret_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly organizer: Uint8Array;
  members: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly memberCount: bigint;
  netDebts: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  readonly tokenColor: Uint8Array;
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
               color_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
