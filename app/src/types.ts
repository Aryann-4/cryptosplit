export interface Group {
  contractAddress: string;
  organizer: Uint8Array;
  tokenColor: Uint8Array;
  members: Member[];
  createdAt: number;
}

export interface Member {
  memberId: Uint8Array;
  label: string;
  isActive: boolean;
}

export interface Expense {
  id: string;
  groupId: string;
  payer: Uint8Array;
  amount: bigint;
  participants: Uint8Array[];
  splitType: 'equal' | 'custom';
  customShares?: Map<string, bigint>;
  description: string;
  timestamp: number;
}

export interface NetDebt {
  debtorId: Uint8Array;
  creditorId: Uint8Array;
  amount: bigint;
}

export interface Settlement {
  debtorId: Uint8Array;
  creditorId: Uint8Array;
  amount: bigint;
  creditorAddress: Uint8Array;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface GroupState {
  group: Group;
  expenses: Expense[];
  netDebts: NetDebt[];
  settlements: Settlement[];
}

export interface CircuitCallResponse {
  status: 'success' | 'error';
  circuit?: string;
  error?: string;
  memberIdPartial?: string;
  txHash?: string;
  proofGenerated?: boolean;
}

export interface WalletInfo {
  address: string;
  shieldedAddress: string | null;
  networkId: string;
  isConnected: boolean;
}
