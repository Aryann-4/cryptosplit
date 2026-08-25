# Product Proposal

## What is the product, and who uses it?

CryptoSplit is a decentralized bill-splitting application — like Splitwise, but built on blockchain. It lets groups of friends, roommates, or travel companions track shared expenses (dinners, rent, groceries, trips), automatically calculates who owes whom, and settles debts on-chain with a single transaction.

**Users:**
- Groups of friends splitting expenses during trips or events
- Roommates dividing rent, utilities, and household costs
- Coworkers sharing lunch or team expenses
- Anyone who wants to split bills without trusting a central app with their financial data

## Why Midnight specifically?

Splitwise stores all your expense data, who you pay, how much, and who you split with — on centralized servers. A transparent blockchain (like Ethereum or Cardano) would solve the trust problem but expose **everything** publicly: every wallet address, every debt, every payment amount.

Midnight solves this perfectly:

- **Commitment scheme**: Members are identified by `memberId = hash(secret)` — a one-way commitment. No wallet address ever appears on-chain.
- **Domain-separated debt keys**: `debtKey = hash(hash(domain, debtorId), creditorId)` — an observer sees a meaningless hash, not "Alice owes Bob $42."
- **ZK circuit proofs**: The `settle()` circuit proves "this debtor authorized sending N tokens to settle their debt" without revealing who the debtor is.
- **Net debt storage**: Only net debts between pairs are stored on-chain. If Alice owes Bob $20 and Bob owes Alice $10, only the net $10 appears.

A transparent chain could never provide this — every expense, every wallet, every payment would be publicly traceable. Midnight's privacy primitives make CryptoSplit actually usable for real financial activity.

## Data Model

| Data Point | Type | Disclosed To |
|---|---|---|
| Wallet addresses | Private witness | No one (never on-chain) |
| Member names/labels | Client-side only | Group members only |
| `memberId = hash(secret)` | Public ledger | Everyone (unlinkable commitment) |
| `debtKey = hash(domain, debtorId, creditorId)` | Public ledger | Everyone (meaningless without secrets) |
| Net debt amounts | Public ledger | Everyone (but linked to hashes, not identities) |
| Token transfer amounts | Public ledger | Everyone (settlement amount only) |
| Expense descriptions | Client-side only | Group members only |
| ZK proof validity | Public ledger | Everyone (proves authorization without identity) |
| Organizer secret | Private witness | No one (stored client-side) |

## Mainnet Feasibility

Yes, this is realistic to reach Mainnet by Level 6. The core smart contract (`cryptosplit.compact`) is already compiled and deployed to Preprod. The contract has 5 impure circuits and 3 pure circuits, all functional. The frontend connects to the Lace wallet and calls circuits through a backend API.

**Remaining work for Mainnet:**
- Migrate from Preprod to Mainnet deployment
- Production-proof the Express backend (currently demo mode on Vercel)
- Add persistent local state (currently in-memory, lost on refresh)
- Gas optimization for the settle circuit
- Audit the commitment scheme for edge cases

The architecture is sound and the privacy model is production-ready. The main gap is infrastructure (hosting a persistent backend, Mainnet wallet funding), not protocol design.
