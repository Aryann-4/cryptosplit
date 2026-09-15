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

  if (!currentMemberId) return null;

  return (
    <div className="glass p-5 animate-slide-up">
      <h3 className="label mb-4">Settle Up</h3>

      {myDebts.length === 0 ? (
        <div className="glass-subtle p-4 text-center">
          <p className="text-sm text-ash">No outstanding debts</p>
          <p className="mono-data text-[10px] mt-1 text-surface-4">Add expenses to see settlements</p>
        </div>
      ) : (
        <>
          <div className="glass-subtle p-4 mb-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-gold/[0.06] rounded-full blur-[40px] pointer-events-none" />
            <div className="relative">
              <div className="label !text-[9px] mb-1">Total you owe</div>
              <div className="text-2xl font-bold text-white">${(Number(totalOwed) / 100).toFixed(2)}</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {myDebts.map((debt, i) => {
              const creditorLabel = getMemberLabel(debt.creditorId);
              return (
                <div key={i} className="glass-subtle p-3 flex items-center justify-between hover:border-white/[0.08] transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
                      <span className="text-xs font-medium text-gold">{creditorLabel.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{creditorLabel}</p>
                      <p className="mono-data text-[10px]">${(Number(debt.amount) / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSettle(debt.creditorId, debt.amount)}
                    disabled={settling}
                    className="btn-primary !py-2.5 !px-6 text-sm disabled:opacity-40"
                  >
                    {settling ? 'Paying...' : 'Pay'}
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
            className="btn-secondary w-full disabled:opacity-40"
          >
            {settling ? 'Processing...' : `Settle All ($${(Number(totalOwed) / 100).toFixed(2)})`}
          </button>
        </>
      )}
    </div>
  );
}
