import type { NetDebt, Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';
import { getMemberLabel } from '../store.ts';

interface BalanceViewProps {
  netDebts: NetDebt[];
  members: Member[];
  currentMemberId?: Uint8Array;
}

export default function BalanceView({ netDebts, members, currentMemberId }: BalanceViewProps) {
  if (netDebts.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-xs text-ash">No outstanding balances</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="label mb-3">Balances</h3>
      <div className="space-y-1.5">
        {netDebts.map((debt, i) => {
          const debtorLabel = getMemberLabel(debt.debtorId);
          const creditorLabel = getMemberLabel(debt.creditorId);
          const isCurrentDebtor = currentMemberId && bytesToHex(debt.debtorId) === bytesToHex(currentMemberId);
          const isCurrentCreditor = currentMemberId && bytesToHex(debt.creditorId) === bytesToHex(currentMemberId);

          return (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-shell-2 border border-shell-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-red-400">{debtorLabel.charAt(0)}</span>
                </div>
                <span className={`text-xs ${isCurrentDebtor ? 'text-red-400 font-medium' : 'text-ash'}`}>
                  {debtorLabel}
                </span>
              </div>
              <span className="text-[10px] text-shell-5">owes</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isCurrentCreditor ? 'text-mint font-medium' : 'text-ash'}`}>
                  {creditorLabel}
                </span>
                <div className="w-6 h-6 rounded bg-mint/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-mint">{creditorLabel.charAt(0)}</span>
                </div>
              </div>
              <span className="text-sm font-medium text-cloud ml-3">${(Number(debt.amount) / 100).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
