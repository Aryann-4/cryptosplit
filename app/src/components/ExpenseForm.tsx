import { useState } from 'react';
import type { Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';
import { getMemberLabel } from '../store.ts';

interface ExpenseFormProps {
  members: Member[];
  onSubmit: (expense: { amount: bigint; participantIds: Uint8Array[]; splitType: 'equal' | 'custom'; description: string }) => void;
}

export default function ExpenseForm({ members, onSubmit }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<number>>(new Set());
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');

  const toggleParticipant = (index: number) => {
    const updated = new Set(selectedParticipants);
    if (updated.has(index)) updated.delete(index);
    else updated.add(index);
    setSelectedParticipants(updated);
  };

  const selectAll = () => setSelectedParticipants(new Set(members.map((_, i) => i)));
  const deselectAll = () => setSelectedParticipants(new Set());

  const handleSubmit = () => {
    if (!amount || selectedParticipants.size === 0) return;
    const participantIds = [...selectedParticipants].map((i) => members[i].memberId);
    onSubmit({
      amount: BigInt(Math.round(parseFloat(amount) * 100)),
      participantIds,
      splitType,
      description,
    });
    setDescription('');
    setAmount('');
    setSelectedParticipants(new Set());
  };

  const perPerson = selectedParticipants.size > 0 && amount
    ? (parseFloat(amount) / selectedParticipants.size).toFixed(2)
    : '0.00';

  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Expense</span>
      </h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-surface-500 mb-1 block">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this expense for?"
            className="input-glass w-full"
          />
        </div>

        <div>
          <label className="text-xs text-surface-500 mb-1 block">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="input-glass w-full text-2xl font-bold"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-surface-500">Split between</label>
            <div className="flex space-x-2">
              <button onClick={selectAll} className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">All</button>
              <button onClick={deselectAll} className="text-[10px] text-surface-600 hover:text-surface-400 transition-colors">None</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {members.map((member, index) => (
              <button
                key={index}
                onClick={() => toggleParticipant(index)}
                className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left transition-all text-sm ${
                  selectedParticipants.has(index)
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/[0.02] border-white/[0.04] text-surface-400 hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                  selectedParticipants.has(index) ? 'bg-indigo-500' : 'bg-white/[0.06]'
                }`}>
                  {selectedParticipants.has(index) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="truncate">{getMemberLabel(member.memberId)}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedParticipants.size > 0 && amount && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
            <span className="text-xs text-surface-500">Per person ({selectedParticipants.size} members)</span>
            <span className="text-lg font-bold text-white">${perPerson}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!amount || selectedParticipants.size === 0}
          className="btn-primary w-full disabled:opacity-40"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}
