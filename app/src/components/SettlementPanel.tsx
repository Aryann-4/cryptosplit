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
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Settle Up</span>
      </h3>

      <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-4">
        <p className="text-xs text-surface-500 mb-1">Total you owe</p>
        <p className="text-2xl font-bold text-white">${(Number(totalOwed) / 100).toFixed(2)}</p>
      </div>

      <div className="space-y-2 mb-4">
        {myDebts.map((debt, i) => {
          const creditorLabel = getMemberLabel(debt.creditorId);
          return (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-emerald-400">{creditorLabel.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{creditorLabel}</p>
                  <p className="text-xs text-surface-500">${(Number(debt.amount) / 100).toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => onSettle(debt.creditorId, debt.amount)}
                disabled={settling}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all disabled:opacity-40"
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
        className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all disabled:opacity-40"
      >
        {settling ? 'Processing...' : `Settle All ($${(Number(totalOwed) / 100).toFixed(2)})`}
      </button>
    </div>
  );
}
