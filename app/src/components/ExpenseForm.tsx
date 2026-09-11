import { useState, useMemo } from 'react';
import type { Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface ExpenseFormProps {
  members: Member[];
  onSubmit: (expense: {
    amount: bigint;
    participantIds: Uint8Array[];
    splitType: 'equal' | 'custom';
    description: string;
  }) => void;
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
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedMembers(new Set(members.filter(m => m.isActive).map((m) => bytesToHex(m.memberId))));
  };

  const perPersonAmount = useMemo(() => {
    if (!amount || selectedMembers.size === 0) return null;
    const totalCents = BigInt(Math.round(parseFloat(amount) * 100));
    return totalCents / BigInt(selectedMembers.size);
  }, [amount, selectedMembers.size]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountBigint = BigInt(Math.round(parseFloat(amount) * 100));
    if (amountBigint <= 0n) return;
    if (selectedMembers.size === 0) return;

    onSubmit({
      amount: amountBigint,
      participantIds: members
        .filter((m) => selectedMembers.has(bytesToHex(m.memberId)))
        .map((m) => m.memberId),
      splitType,
      description,
    });

    setAmount('');
    setDescription('');
    setSelectedMembers(new Set());
  };

  const isValid = amount && parseFloat(amount) > 0 && selectedMembers.size > 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div className="flex items-center space-x-2 mb-1">
        <svg className="w-5 h-5 text-midnight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Add Expense</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500 transition-colors"
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Split Type</label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
            disabled={disabled}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500 transition-colors"
          >
            <option value="equal">Equal Split</option>
            <option value="custom">Custom Amounts</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this expense for?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500 transition-colors"
          disabled={disabled}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Split Among</label>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-400">{selectedMembers.size} of {members.filter(m => m.isActive).length} selected</span>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-midnight-600 hover:text-midnight-800 font-medium"
            >
              Select All
            </button>
          </div>
        </div>
        <div className="space-y-1.5 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
          {members.filter(m => m.isActive).map((member) => {
            const isSelected = selectedMembers.has(bytesToHex(member.memberId));
            return (
              <label
                key={bytesToHex(member.memberId)}
                className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'bg-midnight-50 border border-midnight-200' : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleMember(bytesToHex(member.memberId))}
                  disabled={disabled}
                  className="rounded border-gray-300 text-midnight-600 focus:ring-midnight-500"
                />
                <div className="w-6 h-6 bg-midnight-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-midnight-600 text-xs font-bold">{member.label.charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">{member.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Per-person breakdown */}
      {perPersonAmount !== null && selectedMembers.size > 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Per person</p>
          <p className="text-lg font-bold text-midnight-600">
            ${(Number(perPersonAmount) / 100).toFixed(2)}
            <span className="text-sm font-normal text-gray-500 ml-1">each</span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || !isValid}
        className="w-full bg-gradient-to-r from-midnight-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-midnight-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Expense</span>
      </button>
    </form>
  );
}
