# CryptoSplit
![CI](https://github.com/Aryann-4/cryptosplit/actions/workflows/ci.yml/badge.svg)
> Privacy-preserving bill splitter on Midnight — settle debts with ZK proofs, no wallet addresses on-chain.

## Live Demo
https://cryptosplit-app-96to.vercel.app

## Contract Address

| Network  | Address |
|----------|---------|
| Preprod  | `0bbb4f5c5ccf14fa8ac4b9a4cc9fe87f5003fac446cca13f816ebdadb1a1577a` |

## What This Does

CryptoSplit is a decentralized alternative to Splitwise built on the Midnight Network. Users connect their Lace wallet, create expense groups, add members, track shared expenses, calculate net debts, and settle on-chain — all without exposing wallet addresses or personal information on the public ledger.

## Privacy Model

- **PUBLIC:** Commitment hashes (`memberId`, `debtKey`), token transfer amounts, ZK proof validity
- **PRIVATE:** Wallet addresses, member names, expense descriptions, individual expense amounts, who paid for what
- **PROVED without revealing:** "I am a valid member of this group" (via `addMember`), "I authorize payment of X to settle my debt" (via `settle`) — proved via ZK circuits without revealing the user's secret or wallet address

## Privacy Claim

An on-chain observer sees only commitment hashes (e.g., `debtKey = hash(hash(domain, debtorId), creditorId)`) and token transfers. They **cannot** determine which real wallet addresses correspond to group members, what the original expense amounts were, or who paid for what. The `settle()` circuit proves "this debtor authorized sending N tokens to the creditor's wallet" without the debtor's identity ever appearing on-chain.

## Tech Stack

- **Blockchain:** Midnight Network (Preprod)
- **Smart Contract:** Compact language (`cryptosplit.compact`) — 5 impure circuits, 3 pure circuits
- **Frontend:** React + Vite + Tailwind CSS
- **Wallet Integration:** Midnight Lace wallet via DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- **Backend API:** Express server for circuit calls via Midnight.js SDK
- **ZK Proofs:** Generated locally in browser via proof server
- **CI/CD:** GitHub Actions

## Prerequisites

- [Lace wallet](https://docs.midnight.network/wallet/install-lace) installed (Chrome extension)
- Node.js v22+
- Docker (for proof server)

## Setup & Run Locally

```bash
# Clone the repo
git clone https://github.com/Aryann-4/cryptosplit.git
cd cryptosplit

# Install dependencies
cd app && npm install

# Start proof server (required for ZK proof generation)
docker run -d --name proof-server -p 6300:6300 midnightntwrk/proof-server:8.1.0

# Start the backend API server
export MIDNIGHT_SEED=$(openssl rand -hex 32)
export MIDNIGHT_NETWORK=preprod
npm run server &

# Start the frontend
npm run dev
```

Open http://localhost:3000 in Chrome with Lace wallet installed.

## Run Tests

```bash
# Frontend tests (30 tests)
cd app && npm test

# Root-level contract logic tests (9 tests)
npm test
```

## CI/CD

GitHub Actions runs on every push to `main` and on pull requests:

1. Checks out code
2. Installs Node.js v22 and dependencies
3. Compiles Compact smart contracts
4. Typechecks the frontend
5. Runs all test suites (30 frontend + 9 contract logic)
6. Builds the production frontend

The CI badge at the top of this README shows the current pipeline status.

## Product Proposal

See [PROPOSAL.md](./PROPOSAL.md)

## Demo Video

[Watch Demo](https://drive.google.com/file/d/1W-igvXXWID0aSKYA-BAV0B-BzOmTNFYq/view?usp=sharing)
