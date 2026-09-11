import { useState, useMemo } from 'react';
import type { Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface ExpenseFormProps {
  members: Member[];
  onSubmit: (expense: { amount: bigint; participantIds: Uint8Array[]; splitType: 'equal' | 'custom'; description: string }) => void;
  disabled?: boolean;
}

export default function ExpenseForm({ members, onSubmit, disabled }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedMembers(new Set(members.filter(m => m.isActive).map((m) => bytesToHex(m.memberId))));
  };

  const perPersonAmount = useMemo(() => {
    if (!amount || selectedMembers.size === 0) return null;
    return BigInt(Math.round(parseFloat(amount) * 100)) / BigInt(selectedMembers.size);
  }, [amount, selectedMembers.size]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountBigint = BigInt(Math.round(parseFloat(amount) * 100));
    if (amountBigint <= 0n || selectedMembers.size === 0) return;

    onSubmit({
      amount: amountBigint,
      participantIds: members.filter((m) => selectedMembers.has(bytesToHex(m.memberId))).map((m) => m.memberId),
      splitType,
      description,
    });

    setAmount('');
    setDescription('');
    setSelectedMembers(new Set());
  };

  const isValid = amount && parseFloat(amount) > 0 && selectedMembers.size > 0;

  return (
    <form onSubmit={handleSubmit} className="glass p-6 space-y-5">
      <div className="flex items-center space-x-2 mb-1">
        <svg className="w-5 h-5 text-[#4c6ef5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <h3 className="text-lg font-semibold gradient-text">Add Expense</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-surface-400 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-glass pl-7"
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-400 mb-1.5">Split Type</label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
            disabled={disabled}
            className="input-glass bg-[#12121a]"
          >
            <option value="equal">Equal Split</option>
            <option value="custom">Custom Amounts</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-400 mb-1.5">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this expense for?"
          className="input-glass"
          disabled={disabled}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-surface-400">Split Among</label>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-surface-600">{selectedMembers.size} of {members.filter(m => m.isActive).length}</span>
            <button type="button" onClick={selectAll} className="text-xs text-[#4c6ef5] hover:text-[#748ffc] font-medium">Select All</button>
          </div>
        </div>
        <div className="space-y-1.5 border border-white/[0.06] rounded-xl p-3 max-h-48 overflow-y-auto bg-white/[0.02]">
          {members.filter(m => m.isActive).map((member) => {
            const isSelected = selectedMembers.has(bytesToHex(member.memberId));
            return (
              <label
                key={bytesToHex(member.memberId)}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-[#4c6ef5]/10 border border-[#4c6ef5]/20' : 'hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMember(bytesToHex(member.memberId))}
                  disabled={disabled}
                  className="rounded border-surface-600 text-[#4c6ef5] focus:ring-[#4c6ef5]"
                />
                <div className="w-6 h-6 rounded-full bg-[#4c6ef5]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4c6ef5] text-xs font-bold">{member.label.charAt(0)}</span>
                </div>
                <span className="text-sm text-surface-300 font-medium">{member.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {perPersonAmount !== null && selectedMembers.size > 1 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-xs text-surface-500 mb-1">Per person</p>
          <p className="text-lg font-bold gradient-text-accent">
            ${(Number(perPersonAmount) / 100).toFixed(2)}
            <span className="text-sm font-normal text-surface-500 ml-1">each</span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || !isValid}
        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Expense</span>
      </button>
    </form>
  );
}
