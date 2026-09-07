# CryptoSplit — X/Twitter Launch Posts

## Tweet 1: What the product is

CryptoSplit is a bill splitter that actually protects your privacy.

Splitwise knows who you pay, how much, and when. We put that on Midnight blockchain — but your wallet address, your name, and your spending habits never touch the chain.

Member IDs are commitment hashes. Debts are domain-separated keys. Settlements are ZK-proved.

Your expenses stay yours. 🔒

[LINK]

## Tweet 2: Technical insight

The privacy model in CryptoSplit has 3 layers:

1. memberId = hash(secret) — your on-chain identity is a commitment, not your wallet
2. debtKey = hash(domain, debtorId, creditorId) — observer sees a meaningless hash, not "Alice owes Bob"
3. settle() circuit — proves "I authorize payment" without revealing who "I" am

On-chain: hashes + token transfers
Off-chain: names, addresses, amounts

This is what Midnight enables.

## Tweet 3: Call to try the demo

Try CryptoSplit on Midnight Preprod 🔗

→ Connect Lace wallet
→ Create an expense group
→ Add members (ZK proof generated)
→ Settle debts on-chain

Your wallet address never appears on the blockchain. Only commitment hashes.

Live demo: https://cryptosplit-app-96to.vercel.app

Built with Compact, Midnight.js SDK, and React. Source: https://github.com/Aryann-4/cryptosplit
