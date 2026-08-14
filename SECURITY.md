# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CryptoSplit, please report it responsibly:

- **Do NOT** open a public GitHub issue for security vulnerabilities
- Email the maintainer directly (see README for contact)
- Include steps to reproduce the issue
- Allow 48 hours for initial response

## Security Model

CryptoSplit uses Midnight's ZK proof system for privacy. Key security properties:

1. **Commitment Scheme**: Member identities are `hash(secret)` — the blockchain never sees real identities
2. **Domain Separation**: Debt keys use `hash(domain, debtorId, creditorId)` — prevents cross-contract replay attacks
3. **Private Witnesses**: Wallet addresses, names, and expense details never leave the client
4. **ZK Proofs**: Settlement proofs verify authorization without revealing the signer's identity

## Known Limitations

- The organizer can add/remove members (centralized group management)
- Settlement amounts are visible on-chain (though debtor/creditor identity is hidden)
- No rate limiting on circuit calls (spam protection needs external implementation)
- Client-side storage means data is tied to browser local storage

## Audit Status

- Internal review completed
- No formal third-party audit
- Contract logic is relatively simple (5 circuits, ~130 lines)
