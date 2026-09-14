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
    <div className="card">
      <h3 className="label mb-3">Settle Up</h3>

      <div className="p-3 rounded-md bg-shell-2 border border-shell-4 mb-3">
        <div className="label !text-[9px] mb-1">Total you owe</div>
        <div className="text-xl font-semibold text-cloud">${(Number(totalOwed) / 100).toFixed(2)}</div>
      </div>

      <div className="space-y-1.5 mb-3">
        {myDebts.map((debt, i) => {
          const creditorLabel = getMemberLabel(debt.creditorId);
          return (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-shell-2 border border-shell-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-mint/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-mint">{creditorLabel.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs text-cloud font-medium">{creditorLabel}</p>
                  <p className="mono-data text-[10px]">${(Number(debt.amount) / 100).toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => onSettle(debt.creditorId, debt.amount)}
                disabled={settling}
                className="btn-primary !py-1 !px-3 text-xs disabled:opacity-40"
              >
                {settling ? '...' : 'Pay'}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={async () => {
          for (const debt of myDebts) {
            await onSettle(debt.creditorId, debt.amount);
          }
        }}
        disabled={settling}
        className="btn-ghost w-full text-xs disabled:opacity-40"
      >
        {settling ? 'Processing...' : `Settle All ($${(Number(totalOwed) / 100).toFixed(2)})`}
      </button>
    </div>
  );
}
