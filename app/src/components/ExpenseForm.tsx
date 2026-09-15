import { useState } from 'react';
import type { Member } from '../types.ts';
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
      <h3 className="label mb-4">Add Expense</h3>

      <div className="space-y-3">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this for?"
          className="input-glass"
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="input-glass text-xl font-bold"
        />

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="label !text-[9px]">Split between</span>
            <div className="flex gap-2.5">
              <button onClick={selectAll} className="text-xs text-accent hover:text-accent-hover transition-colors">All</button>
              <button onClick={deselectAll} className="text-xs text-surface-5 hover:text-ash transition-colors">None</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {members.map((member, index) => (
              <button
                key={index}
                onClick={() => toggleParticipant(index)}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all text-sm ${
                  selectedParticipants.has(index)
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-white/[0.02] border-white/[0.06] text-ash hover:bg-white/[0.04]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                  selectedParticipants.has(index) ? 'bg-accent' : 'bg-white/[0.06]'
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
          <div className="glass-subtle p-3 flex justify-between items-center">
            <span className="mono-data text-[10px]">Per person ({selectedParticipants.size})</span>
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
