// The contract only ever enforces "the shares you registered sum to the
// total" — how you arrive at those per-participant amounts is entirely an
// off-chain decision. This module has two ready-made rules; add your own
// the same way (e.g. weighted by what each person ordered).

export type ParticipantShare = {
  label: string; // local display label only, never sent on-chain
  amount: bigint;
};

/**
 * Split `total` evenly across `count` participants. Any remainder from
 * integer division is assigned to the first participant so the shares
 * always sum to exactly `total`.
 */
export function equalSplit(total: bigint, labels: string[]): ParticipantShare[] {
  const count = BigInt(labels.length);
  if (count <= 0n) {
    throw new Error('equalSplit needs at least one participant');
  }
  const base = total / count;
  const remainder = total % count;

  return labels.map((label, i) => ({
    label,
    amount: i === 0 ? base + remainder : base,
  }));
}

/**
 * Register explicit, unequal shares (e.g. "who ordered what"). Throws if
 * the shares don't add up to `total`, so mistakes are caught before you
 * even submit a transaction.
 */
export function customSplit(
  total: bigint,
  shares: Array<{ label: string; amount: bigint }>,
): ParticipantShare[] {
  const sum = shares.reduce((acc, s) => acc + s.amount, 0n);
  if (sum !== total) {
    throw new Error(
      `custom shares sum to ${sum}, which does not match the total bill amount ${total}`,
    );
  }
  return shares;
}
