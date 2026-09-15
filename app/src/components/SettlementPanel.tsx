import type { NetDebt, Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';
import { getMemberLabel } from '../store.ts';

interface SettlementPanelProps {
  netDebts: NetDebt[];
  members: Member[];
  currentMemberId?: Uint8Array;
  onSettle: (creditorId: Uint8Array, amount: bigint) => void;
  settling: boolean;
}

export default function SettlementPanel({ netDebts, members, currentMemberId, onSettle, settling }: SettlementPanelProps) {
  const myDebts = currentMemberId
    ? netDebts.filter((d) => bytesToHex(d.debtorId) === bytesToHex(currentMemberId))
    : [];
  const totalOwed = myDebts.reduce((sum, d) => sum + d.amount, 0n);

  if (myDebts.length === 0) return null;

  return (
    <div className="glass p-5">
      <h3 className="label mb-4">Settle Up</h3>

      {/* Total card */}
      <div className="glass-subtle p-4 mb-4">
        <div className="label !text-[9px] mb-1">Total you owe</div>
        <div className="text-2xl font-bold text-white">${(Number(totalOwed) / 100).toFixed(2)}</div>
      </div>

      {/* Per-creditor */}
      <div className="space-y-2 mb-4">
        {myDebts.map((debt, i) => {
          const creditorLabel = getMemberLabel(debt.creditorId);
          return (
            <div key={i} className="glass-subtle p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-mint/10 border border-mint/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-mint">{creditorLabel.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{creditorLabel}</p>
                  <p className="mono-data text-[10px]">${(Number(debt.amount) / 100).toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => onSettle(debt.creditorId, debt.amount)}
                disabled={settling}
                className="btn-primary !py-2.5 !px-5 text-sm disabled:opacity-40"
              >
                {settling ? 'Paying...' : 'Pay'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Settle all */}
      <button
        onClick={async () => {
          for (const debt of myDebts) {
            await onSettle(debt.creditorId, debt.amount);
          }
        }}
        disabled={settling}
        className="btn-secondary w-full disabled:opacity-40"
      >
        {settling ? 'Processing...' : `Settle All ($${(Number(totalOwed) / 100).toFixed(2)})`}
      </button>
    </div>
  );
}
