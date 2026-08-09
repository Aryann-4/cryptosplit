# CryptoSplit - Decentralized Bill & Expense Splitter

## Overview

Extend the existing Midnight Network split-bill-dapp with a new **CryptoSplit** contract for expense tracking + debt netting, and build a **React + Vite** web frontend.

---

## Architecture

### What Changes

| Component | Action | Description |
|-----------|--------|-------------|
| `contract/src/cryptosplit.compact` | **NEW** | Compact contract for groups, expenses, debt ledger, settlement |
| `contract/src/cryptosplit-witnesses.ts` | **NEW** | Witness types for CryptoSplit |
| `app/` | **REPLACE** | Replace CLI demo with React + Vite web app |
| `contract/src/splitbill.compact` | **KEEP** | Original contract preserved as reference |

### What Stays

- `midnight-local-dev/` - Local devnet (unchanged)
- Root `package.json` workspace structure
- `contract/package.json` build tooling

---

## Phase 1: Smart Contract (`cryptosplit.compact`)

### Contract State

```
// Group
organizer: Bytes<32>              // commitment to organizer secret
members: Map<Bytes<32>, Bool>     // memberId -> isRegistered
memberCount: Counter

// Debt Ledger (net debts between pairs)
// Key: hash("cryptosplit:debt:v1", debtorId, creditorId)
// Value: net amount debtor owes creditor
netDebts: Map<Bytes<32>, Uint<128>>

// Token
tokenColor: Bytes<32>
```

### Circuits

**Pure (off-chain, no proof):**
- `deriveId(secret, domain)` - identity derivation
- `memberId(secret)` - member commitment
- `debtKey(debtorId, creditorId)` - derive map key for debt pair
- `getDebt(debtorId, creditorId)` - query net debt
- `isMember(memberId)` - check membership

**Impure/Provable (on-chain transactions):**

| Circuit | Caller | Description |
|---------|--------|-------------|
| `constructor(organizerSecret, memberSecrets[], tokenColor)` | Deploy | Create group with initial members |
| `addMember(organizerSecret, memberSecret)` | Organizer | Add new member |
| `removeMember(organizerSecret, memberId)` | Organizer | Remove member (assert no outstanding debts) |
| `setNetDebt(organizerSecret, debtorId, creditorId, amount)` | Organizer | Record/update net debt between two members |
| `settle(debtorSecret, creditorId, amount, creditorAddress)` | Debtor | Pay creditor, reduces debt |

### Key Design Decisions

1. **Privacy**: Members identified by `memberId = hash(secret, domain)`, not wallet addresses
2. **Netting**: Off-chain calculation → on-chain storage (gas-efficient, no O(n^2) transactions)
3. **Settlement**: Creditor address provided at call time (not stored on-chain)
4. **Debt Key**: `persistentHash<Vector<3, Bytes<32>>>([domain, debtorId, creditorId])` for unique pair keys

### Flow

```
1. Organizer deploys contract with member list
2. Members join (or organizer adds them)
3. Members log expenses off-chain (app calculates splits)
4. App calculates net debts from all expenses
5. Organizer calls setNetDebt() for each debtor-creditor pair
6. Debtors call settle() to pay creditors
7. Contract transfers tokens directly to creditor's wallet
```

---

## Phase 2: Off-chain Logic

### Files

| File | Purpose |
|------|---------|
| `app/src/lib/contract.ts` | CompiledCryptoSplit wrapper, contract deployment/call helpers |
| `app/src/lib/crypto.ts` | Secret generation, memberId derivation, debtKey derivation |
| `app/src/lib/split.ts` | Equal split, custom split, net debt calculation from expenses |
| `app/src/lib/providers.ts` | Midnight provider assembly for CryptoSplit circuits |
| `app/src/lib/config.ts` | Network configuration (keep existing) |
| `app/src/lib/types.ts` | Shared TypeScript types (Group, Expense, Debt, etc.) |

### Net Debt Algorithm (`split.ts`)

```typescript
interface Expense {
  payer: Uint8Array;       // memberId of who paid
  amount: number;          // total amount
  participants: Uint8Array[]; // memberIds involved
  splitType: 'equal' | 'custom';
  customShares?: Map<Uint8Array, number>;
}

function calculateNetDebts(expenses: Expense[]): Map<string, bigint> {
  // 1. Calculate each person's share of each expense
  // 2. Track gross debts (A owes B)
  // 3. Net out mutual debts (if A owes B $20 and B owes A $10 → net B owes A $10)
  // 4. Return map of net debts: key="debtorId:creditorId", value=amount
}
```

---

## Phase 3: React + Vite Frontend

### Tech Stack

- **React 18** with TypeScript
- **Vite** for dev server + bundling
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Midnight wallet-sdk** for wallet connection

### Directory Structure

```
app/
  index.html
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  tsconfig.json
  package.json
  src/
    main.tsx                    # Entry point
    App.tsx                     # Router setup
    index.css                   # Tailwind imports
    components/
      WalletConnect.tsx         # Connect Midnight wallet button/display
      GroupCard.tsx             # Group summary card
      GroupManager.tsx          # Create/manage groups
      ExpenseForm.tsx           # Add new expense
      ExpenseList.tsx           # List expenses in a group
      BalanceView.tsx           # Net balance dashboard
      SettlementPanel.tsx       # One-click settle debts
      MemberList.tsx            # List group members
    hooks/
      useWallet.ts              # Wallet connection state
      useContract.ts            # Contract deploy/interact
      useGroup.ts               # Group state management
    lib/
      contract.ts               # CryptoSplit compiled contract
      crypto.ts                 # Secret/key generation
      split.ts                  # Split calculation logic
      providers.ts              # Midnight providers
      config.ts                 # Network config
      types.ts                  # Shared types
    pages/
      Home.tsx                  # Landing: create/join group
      Group.tsx                 # Group detail: expenses, balances, settle
```

### Pages

**Home (`/`)**
- Connect wallet button
- Create new group (enter member addresses, token)
- List groups the user belongs to (read from chain)

**Group (`/group/:address`)**
- Group info header (organizer, members, token)
- Expense form (add expense with participants)
- Expense list (all recorded expenses)
- Balance dashboard (net debts between all members)
- Settlement panel (settle all debts with one click)

### Component Details

**WalletConnect.tsx**
- Uses `@midnight-ntwrk/wallet-sdk` to connect
- Displays connected address and balance
- Stores wallet seed in localStorage (with warning)

**ExpenseForm.tsx**
- Input: total amount, split type (equal/custom)
- Input: select participants (checkboxes)
- Input: description (optional)
- On submit: calculates shares, updates local state, triggers net debt recalculation

**BalanceView.tsx**
- Shows all member pairs with net debts
- Color-coded: green (owed money), red (owes money)
- Shows total group spending

**SettlementPanel.tsx**
- Lists all debts the connected user owes
- "Settle All" button triggers `settle()` for each debt
- Shows transaction status

---

## Phase 4: Integration & Testing

### Local Devnet Testing

1. Start local devnet: `npm run start-devnet` (from midnight-local-dev)
2. Fund test accounts
3. Deploy CryptoSplit contract
4. Test full flow: create group → add expenses → calculate nets → settle

### Build Commands

```json
{
  "scripts": {
    "compact": "npm run compact --workspace=contract",
    "build:contract": "npm run build --workspace=contract",
    "dev": "npm run dev --workspace=app",
    "build": "npm run build --workspace=app",
    "demo": "npm run demo --workspace=app"
  }
}
```

---

## Implementation Order

1. **Contract** (`cryptosplit.compact`) → compile → verify artifacts
2. **Off-chain lib** (`lib/crypto.ts`, `lib/split.ts`, `lib/types.ts`)
3. **Contract wrapper** (`lib/contract.ts`, `lib/providers.ts`)
4. **React setup** (Vite, Tailwind, Router)
5. **Wallet connection** (`hooks/useWallet.ts`, `WalletConnect.tsx`)
6. **Group management** (`GroupManager.tsx`, `Home.tsx`)
7. **Expense entry** (`ExpenseForm.tsx`, `ExpenseList.tsx`)
8. **Balance view** (`BalanceView.tsx`)
9. **Settlement** (`SettlementPanel.tsx`)
10. **End-to-end testing** on local devnet

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Compact map key collisions | Use domain-separated `persistentHash` with 3-component vector |
| `Uint<128>` overflow on large amounts | Validate amounts off-chain before calling contract |
| Wallet SDK version mismatch | Use existing v1.2.0 API (FluentWalletBuilder pattern) |
| No loops in Compact | Netting happens off-chain, contract stores final net debts |
| Gas costs for many debt updates | Batch updates where possible, or use single `setNetDebt` per pair |
