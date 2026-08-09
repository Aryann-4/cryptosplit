# SplitBill — a privacy-preserving split-the-bill dApp on Midnight

A group of friends deposit their share of a bill into a smart contract; once
everyone has paid, the pooled funds are automatically swept to whoever
fronted the tab. Built with [Compact](https://docs.midnight.network/compact),
Midnight's TypeScript-flavored smart contract language.

## How it works

```
organizer                                    contract                         friends
    │  deploy(total, recipient, token)           │                                │
    ├─────────────────────────────────────────►  │  status = SETUP               │
    │  addParticipant(friendSecret, share) x N    │                                │
    ├─────────────────────────────────────────►  │  owed[pid] = share             │
    │  finalizeSetup()                            │                                │
    ├─────────────────────────────────────────►  │  status = COLLECTING           │
    │                                             │        deposit(secret, amount)│
    │                                             │  ◄─────────────────────────────┤
    │                                             │  deposited[pid] += amount      │
    │                                             │  (auto) status = FUNDED        │
    │  settle()  [anyone may call]                │        when fully paid        │
    ├─────────────────────────────────────────►  │  pays out to `recipient`       │
    │                                             │  status = SETTLED              │
```

**Privacy model.** No participant's wallet address ever appears on-chain.
Each participant is tracked only by `participantId = hash(domain, secret)` —
a commitment to a secret only they know. Registering and depositing both
re-derive this commitment from a caller-supplied secret inside the ZK
circuit, so the chain only ever sees "the holder of a valid secret paid
their share," never who that is. The bill amount, split rule (equal or
custom), and settlement recipient are the only things that are public.

**Splitting rules.** The contract enforces exactly one invariant: registered
shares must sum to the total bill. How you arrive at each person's share —
even split, "Sam had the steak," a tip weighted by order size — is computed
off-chain (see `app/src/split.ts`) and only the resulting amounts are
submitted on-chain.

**Money movement.** Deposits and the final payout use Midnight's unshielded
(transparent) token primitives — `receiveUnshielded` to pull each deposit
into the contract, `sendUnshielded` to pay the recipient out in one
transaction. The demo uses the native NIGHT token; swap in any
contract-minted token by passing a different color to the constructor.

## Project layout

```
split-bill-dapp/
├── contract/               # the Compact smart contract
│   └── src/
│       ├── splitbill.compact
│       ├── witnesses.ts    # empty — this contract uses no witnesses
│       └── index.ts        # compiled-contract wrapper
└── app/                    # deploy script + off-chain helpers
    └── src/
        ├── config.ts       # local / preview / preprod network config
        ├── wallet.ts        # wallet-sdk adapter
        ├── providers.ts     # indexer/proof/zk-config provider set
        ├── contract.ts      # wraps the compiled contract for deployment
        ├── split.ts         # equal-split / custom-split helpers
        └── demo.ts          # end-to-end walkthrough
```

## Prerequisites

- The **Compact toolchain** — see [Install the toolchain](https://docs.midnight.network/getting-started/installation). This targets compiler `0.31.x` / language version `0.23`.
- **Node.js 22+**
- **Docker** and Docker Compose v2 (for the local devnet + proof server)

## Set up a local devnet

```bash
git clone https://github.com/midnightntwrk/midnight-local-dev.git
cd midnight-local-dev
npm install
npm start
```

Leave this running in its own terminal — it starts the node, indexer, and
proof server, and funds a genesis wallet with NIGHT for you.

## Build

From the project root:

```bash
npm install
npm run compact        # compiles splitbill.compact -> contract/src/managed
npm run build:contract # compiles the contract package's TypeScript
```

## Run the demo

```bash
MIDNIGHT_NETWORK=local \
MIDNIGHT_SEED=0000000000000000000000000000000000000000000000000000000000000001 \
npm run demo --workspace=app
```

That seed is the local devnet's pre-funded genesis wallet. The script:

1. Deploys `SplitBill` for a 300-unit dinner bill.
2. Registers three friends (Alex, Bri, Cass) on an equal 100/100/100 split.
3. Locks the participant list.
4. Has each friend deposit their share.
5. Confirms the bill auto-flips to `FUNDED`, then settles it to the payer.
6. Reads the payer's wallet balance back to confirm the payout landed.

To run against the public **Preprod** testnet instead, set
`MIDNIGHT_NETWORK=preprod`, generate a throwaway seed with
`openssl rand -hex 32`, and fund the address the script prints at the
[Preprod faucet](https://midnight-tmnight-preprod.nethermind.dev/) — the
script waits for the funds and otherwise runs identically.

## Extending this

- **Custom splits.** Use `customSplit()` from `app/src/split.ts` instead of
  `equalSplit()` and pass explicit per-person amounts to `addParticipant`.
- **A real multi-wallet flow.** The demo drives every step from one wallet
  for clarity. In production, each participant runs their own instance of
  this app (or a web frontend built on the same `contract` package) against
  their own wallet, and only ever needs the contract address plus their own
  secret.
- **A different token.** Mint your own contract token (see Midnight's
  [unshielded token tutorial](https://docs.midnight.network/tokens/unshielded-token))
  and pass its color instead of `unshieldedToken().raw` to the constructor.
- **Deadlines.** Add a `blockTimeGte` check to `deposit`/`settle` if you want
  the bill to auto-cancel after a due date.

## Notes on this generated project

This project was written against Midnight's Compact `0.23` language
reference and the `4.1.1` / `1.0.0` SDK package versions documented as of
this writing. Midnight is still evolving quickly — if `compact compile`
reports a type or syntax mismatch, check the
[Compact language reference](https://docs.midnight.network/develop/reference/compact/lang-ref)
and [release notes](https://docs.midnight.network/relnotes/overview) for
what's changed since.
