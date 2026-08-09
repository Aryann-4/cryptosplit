import { useState } from 'react';
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
    setSelectedMembers(new Set(members.map((m) => bytesToHex(m.memberId))));
  };

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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Add Expense</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this expense for?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500"
          disabled={disabled}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Split Among</label>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-midnight-600 hover:text-midnight-800"
          >
            Select All
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {members.filter(m => m.isActive).map((member) => (
            <label
              key={bytesToHex(member.memberId)}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedMembers.has(bytesToHex(member.memberId))}
                onChange={() => toggleMember(bytesToHex(member.memberId))}
                disabled={disabled}
                className="rounded border-gray-300 text-midnight-600 focus:ring-midnight-500"
              />
              <span className="text-sm text-gray-700">{member.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Split Type</label>
        <select
          value={splitType}
          onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500"
        >
          <option value="equal">Equal Split</option>
          <option value="custom">Custom Amounts</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={disabled || !amount || selectedMembers.size === 0}
        className="w-full bg-midnight-600 text-white py-2 rounded-lg font-medium hover:bg-midnight-700 disabled:opacity-50"
      >
        Add Expense
      </button>
    </form>
  );
}
