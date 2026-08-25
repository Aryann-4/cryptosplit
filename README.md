# CryptoSplit — Decentralized Bill Splitter on Midnight

A decentralized alternative to Splitwise. Track shared expenses, calculate net debts, and settle on-chain using Midnight's privacy-preserving smart contracts.

## How it works

```
organizer                                    contract                         members
    │  deploy(organizerSecret, tokenColor)       │                                │
    ├─────────────────────────────────────────►  │  members = {}                 │
    │  addMember(organizerSecret, memberSecret)  │                                │
    ├─────────────────────────────────────────►  │  members[mid] = 1             │
    │                                             │                                │
    │  [off-chain: log expenses, calc nets]       │                                │
    │                                             │                                │
    │  setNetDebt(organizerSecret, debtor,        │                                │
    │             creditor, amount)               │                                │
    ├─────────────────────────────────────────►  │  netDebts[key] = amount       │
    │                                             │                                │
    │                                             │  settle(debtorSecret,          │
    │                                             │    creditorId, amount, addr)  │
    │                                             │  ◄─────────────────────────────┤
    │                                             │  netDebts[key] -= amount      │
    │                                             │  sendUnshielded → creditor    │
```

**Privacy model.** No wallet address ever appears on-chain. Members are tracked by `memberId = hash(secret, domain)` — a commitment to a secret only they know. The organizer can transfer rights via `transferOrganizer()`.

**Debt netting.** Expenses are calculated off-chain. The contract stores only net debts between pairs. If A owes B $20 and B owes A $10, only the net $10 appears on-chain.

**One-click settlement.** Debtors trigger a single `settle()` transaction. The contract pulls tokens from the debtor and sends them directly to the creditor's wallet.

## Network Configuration

| Network | Network ID | RPC Endpoint | Indexer | Indexer WS | Proof Server |
|---------|-----------|--------------|---------|------------|--------------|
| **Local** | `undeployed` | `http://127.0.0.1:9944` | `http://127.0.0.1:8088/api/v4/graphql` | `ws://127.0.0.1:8088/api/v4/graphql/ws` | `http://127.0.0.1:6300` |
| **Preview** | `preview` | `https://rpc.preview.midnight.network` | `https://indexer.preview.midnight.network/api/v4/graphql` | `wss://indexer.preview.midnight.network/api/v4/graphql/ws` | Local (`http://127.0.0.1:6300`) |
| **Preprod** | `preprod` | `https://rpc.preprod.midnight.network` | `https://indexer.preprod.midnight.network/api/v4/graphql` | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` | Local (`http://127.0.0.1:6300`) |

**Faucets:**
- **Preprod:** https://midnight-tmnight-preprod.nethermind.dev/
- **Preview:** Check Midnight Discord for faucet access

**Setting the network:**

```bash
export MIDNIGHT_NETWORK=local    # or preview, preprod
```

**Running a local proof server** (required for preview/preprod):

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0
```

## Project layout

```
split-bill-dapp/
├── contract/                  # Compact smart contracts
│   └── src/
│       ├── cryptosplit.compact    # CryptoSplit: groups, debt tracking, settlement
│       ├── splitbill.compact      # Original SplitBill (pot-based splitting)
│       ├── witnesses.ts           # Witness types
│       └── index.ts               # Compiled contract wrappers
├── app/                       # React + Vite frontend
│   └── src/
│       ├── components/            # UI components
│       ├── hooks/                 # React hooks
│       ├── pages/                 # Home, Group pages
│       ├── crypto.ts              # Identity derivation (matches contract)
│       ├── store.ts               # Local state management
│       ├── splitCalc.ts           # Net debt calculation
│       └── types.ts               # Shared types
└── midnight-local-dev/        # Docker-based local devnet
```

## Prerequisites

- **Node.js 22+**
- **Compact toolchain** — see [Install the toolchain](https://docs.midnight.network/getting-started/installation)
- **Docker** and Docker Compose v2 (for local devnet)

## Quick start (local devnet)

```bash
# 1. Start local devnet
cd midnight-local-dev
npm install
npm start

# 2. In another terminal — fund test accounts
# Select option [1], enter ./accounts.json

# 3. Build the frontend
cd ../app
npm install
npm run dev
```

Open http://localhost:3000, connect with a funded wallet, and start splitting bills.

## Running with Lace Wallet (Preprod)

### Prerequisites
- **Midnight Lace wallet** extension installed in Chrome
- **Proof server** running locally: `docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0`

### Steps

```bash
cd app
npm install

# Start API server (for circuit calls)
export MIDNIGHT_SEED=<your_64_char_hex_seed>
export MIDNIGHT_NETWORK=preprod
npm run server &

# Start frontend
npm run dev

# Or run both together:
npm start
```

1. Open http://localhost:3000
2. Click "Connect Lace Wallet" — approve in the Lace extension
3. Create a group, add expenses, and settle debts
4. Watch the "Circuit Status" indicator when settling — each settlement calls the `settle()` circuit on-chain

### Faucet
Fund your wallet at https://midnight-tmnight-preprod.nethermind.dev/

## Build

```bash
npm install
npm run compact        # compile contracts
npm run build:contract # build contract TypeScript
npm run dev            # start dev server
```

## CryptoSplit Contract Circuits

| Circuit | Caller | Arguments | Description |
|---------|--------|-----------|-------------|
| `addMember` | Organizer | `organizerSecret, memberSecret` | Register a new group member |
| `removeMember` | Organizer | `organizerSecret, targetMemberId` | Deactivate a member |
| `setNetDebt` | Organizer | `organizerSecret, debtorId, creditorId, amount` | Record net debt between two members |
| `settle` | Debtor | `debtorSecret, creditorId, amount, creditorAddress` | Pay creditor, reduce debt |
| `transferOrganizer` | Organizer | `organizerSecret, newOrganizerSecret` | Transfer organizer rights |

**Pure circuits (off-chain):**

| Circuit | Arguments | Returns | Description |
|---------|-----------|---------|-------------|
| `deriveId` | `secret, domain` | `Bytes<32>` | Domain-separated identity derivation |
| `memberId` | `secret` | `Bytes<32>` | Derive member commitment |
| `debtKey` | `debtorId, creditorId` | `Bytes<32>` | Derive map key for debt pair |

## SDK versions

- Compact compiler: `0.31.x`
- Compact language: `0.23`
- SDK packages: `4.1.1`
- Wallet SDK: `1.2.0`

- ## Deployed Contract

[#deployed-contract](#deployed-contract)

- **Network:** Preprod
- **Contract ID:** `0bbb4f5c5ccf14fa8ac4b9a4cc9fe87f5003fac446cca13f816ebdadb1a1577a`
- **Deployed on:** 16/08/2026


## Privacy Features

### What the blockchain sees vs. what stays private

| On-chain (public) | Off-chain (private) |
|-------------------|---------------------|
| `memberId = hash(secret)` | Wallet addresses |
| `debtKey = hash(debtorId, creditorId)` | Names or labels |
| Token transfer amounts | Expense descriptions |
| Transaction proofs | Individual expense amounts |

### How it works
1. **Commitment scheme**: Each member generates a random `secret`. Their on-chain identity is `memberId = hash(secret)` — a one-way commitment.
2. **Domain separation**: Debt keys use `debtKey = hash(hash(domain, debtorId), creditorId)` to prevent collisions between different data types.
3. **ZK circuits**: The `settle()` circuit proves "this debtor authorized payment of X to creditor" without revealing the debtor's wallet address on-chain.
4. **Net debt storage**: Only net debts are stored (e.g., if Alice owes Bob $20 and Bob owes Alice $10, only $10 net is tracked).

## API Server

The backend API server (`server.ts`) handles circuit calls:

| Endpoint | Method | Circuit | Description |
|----------|--------|---------|-------------|
| `/api/health` | GET | — | Check server status |
| `/api/deploy` | POST | — | Deploy contract to network |
| `/api/add-member` | POST | `addMember` | Register a new group member |
| `/api/set-net-debt` | POST | `setNetDebt` | Record net debt on-chain |
| `/api/settle` | POST | `settle` | Execute settlement transaction |

```bash
# Start API server
export MIDNIGHT_SEED=<hex_seed>
export MIDNIGHT_NETWORK=preprod
npm run server
```

See [Compact language reference](https://docs.midnight.network/develop/reference/compact/lang-ref) and [release notes](https://docs.midnight.network/relnotes/overview) for updates.
