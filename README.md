# CryptoSplit
![CI](https://github.com/Aryann-4/cryptosplit/actions/workflows/ci.yml/badge.svg)
> Privacy-preserving bill splitter on Midnight — settle debts with ZK proofs, no wallet addresses on-chain.

## Live Demo
https://cryptosplit-app-96to.vercel.app

## Contract Address

| Network  | Address |
|----------|---------|
| Preprod  | `0bbb4f5c5ccf14fa8ac4b9a4cc9fe87f5003fac446cca13f816ebdadb1a1577a` |

## What This Product Does

Splitwise is great for tracking shared expenses — but it stores all your financial relationships on centralized servers. Every dinner, every rent payment, every "who owes whom" sits in a database that can be sold, hacked, or subpoenaed. For people splitting sensitive expenses (medical costs, family finances, business travel), this is a real problem.

CryptoSplit solves this by moving bill-splitting to the Midnight blockchain. Users connect their Lace wallet, create expense groups, and settle debts on-chain — but here's the key: **no wallet address ever appears on the blockchain**. Member identities are commitment hashes (`memberId = hash(secret)`), debt relationships are domain-separated keys, and settlement is proved via ZK circuits. An observer sees only meaningless hashes and token transfers.

This matters because Midnight's privacy primitives enable something a transparent chain cannot: real financial activity without surveillance. You can prove you settled your debt without revealing who you are, how much you owe, or who you owe it to.

## Privacy Model

- **What is PUBLIC (on-chain, anyone can see):** Commitment hashes (`memberId`, `debtKey`), token transfer amounts, ZK proof validity, net debt values linked to hash pairs
- **What is PRIVATE (private witness, never on-chain):** Wallet addresses, member names/labels, expense descriptions, individual expense amounts, who paid for what, organizer secrets
- **What the user PROVES without revealing:** "I am a valid member of this group" (via `addMember`), "I authorize payment of X to settle my debt" (via `settle`) — proved via ZK circuits without revealing the user's secret or wallet address

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
# 1. Clone the repo
git clone https://github.com/Aryann-4/cryptosplit.git
cd cryptosplit

# 2. Install dependencies
cd app && npm install

# 3. Start proof server (required for ZK proof generation)
docker run -d --name proof-server -p 6300:6300 midnightntwrk/proof-server:8.1.0

# 4. Start the backend API server
export MIDNIGHT_SEED=$(openssl rand -hex 32)
export MIDNIGHT_NETWORK=preprod
npm run server &

# 5. Start the frontend
npm run dev
```

Open http://localhost:3000 in Chrome with Lace wallet installed.

## Run Tests

```bash
# Frontend tests (30 tests)
cd app && npm test

# Contract logic tests (9 tests)
npm test
```

## CI/CD

GitHub Actions runs on every push to `main` and on pull requests:

1. Checks out code
2. Installs Node.js v22 and dependencies
3. Typechecks the frontend
4. Runs all test suites (30 frontend + 9 contract logic)
5. Builds the production frontend

The CI badge at the top of this README shows the current pipeline status.

## Usage Guide

See [docs/USAGE.md](./docs/USAGE.md) for a step-by-step guide with screenshots.

## Product X Profile
[@CryptoSplit4](https://x.com/CryptoSplit4)

## Demo Video

[Watch Demo](https://drive.google.com/file/d/1W-igvXXWID0aSKYA-BAV0B-BzOmTNFYq/view?usp=sharing)
