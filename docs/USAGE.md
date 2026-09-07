# How to Use CryptoSplit

## What You Need

- A Chrome browser with the [Midnight Lace wallet](https://docs.midnight.network/wallet/install-lace) extension installed
- Some test tokens on the Midnight Preprod network (get them from the [faucet](https://midnight-tmnight-preprod.nethermind.dev/))
- An internet connection

## Step-by-Step Guide

1. **Open the app** at https://cryptosplit-app-96to.vercel.app
2. **Select your network** from the dropdown (Preprod for testing)
3. **Click "Connect Lace Wallet"** — your Lace wallet will pop up asking for approval. Click "Approve" or "Always Allow"
4. **Your wallet address appears** on screen, confirming you're connected
5. **Click "Create Group"** — type in the names of people you want to split expenses with (e.g., Alice, Bob, Charlie)
6. **Click "Create Group"** to confirm — you'll be taken to the group page
7. **Add an expense** — type the total amount, who paid, select who's splitting, and add a description. Click "Add Expense"
8. **See the balances** — the right sidebar shows who owes whom and how much
9. **Add members on-chain** — click "+ Add Member" in the Members panel. This calls the `addMember` circuit and generates a ZK proof
10. **Settle debts** — click "Pay" next to any debt you owe. The `settle` circuit proves you authorized the payment without revealing your wallet address
11. **Disconnect** — click "Disconnect" when you're done

## What Gets Proved (and What Stays Private)

| What happens | On-chain? | What the blockchain sees |
|---|---|---|
| You connect your wallet | No | Nothing — wallet stays private |
| You add a member | Yes | A commitment hash: `hash(your secret)` — not your name or address |
| You record an expense | No | Nothing — expenses are client-side only |
| You settle a debt | Yes | A ZK proof that you authorized payment — no identity revealed |
| You transfer organizer rights | Yes | A commitment hash of the new organizer — not their address |

The key insight: **the blockchain never knows who you are**. It only sees commitment hashes that look like random strings. Your wallet address, your name, and your spending habits are never exposed.

## Troubleshooting

**"No Midnight wallet found"**
Install the Midnight Lace wallet extension from the Chrome Web Store.

**"Network id mismatch"**
Make sure the network dropdown in the app matches what your Lace wallet is set to. Open Lace → click the network name at the top → check which network is selected.

**"Wallet connection was not approved"**
When the Lace popup appears, you need to click "Approve" or "Always Allow". If you clicked "Deny", try connecting again.

**"No outstanding debts"**
You need to add expenses first before you can settle. Add an expense with at least 2 participants.

**App shows "Group not found"**
Groups are stored in your browser's local storage. If you clear your browser data, you'll need to create a new group.
