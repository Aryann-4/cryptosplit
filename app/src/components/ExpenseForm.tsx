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
    <div className="card">
      <h3 className="label mb-3">Add Expense</h3>

      <div className="space-y-2.5">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="input-shell"
        />

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="input-shell text-lg font-semibold"
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="label !text-[9px]">Split between</span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-[10px] text-action hover:text-action-light transition-colors">All</button>
              <button onClick={deselectAll} className="text-[10px] text-shell-5 hover:text-ash transition-colors">None</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {members.map((member, index) => (
              <button
                key={index}
                onClick={() => toggleParticipant(index)}
                className={`flex items-center gap-2 p-2 rounded-md border text-left transition-all text-xs ${
                  selectedParticipants.has(index)
                    ? 'bg-action/10 border-action/30 text-action'
                    : 'bg-shell-2 border-shell-4 text-ash hover:bg-shell-3'
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                  selectedParticipants.has(index) ? 'bg-action' : 'bg-shell-4'
                }`}>
                  {selectedParticipants.has(index) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
          <div className="flex justify-between items-center p-2.5 rounded-md bg-shell-2 border border-shell-4">
            <span className="mono-data text-[10px]">Per person ({selectedParticipants.size})</span>
            <span className="text-sm font-medium text-cloud">${perPerson}</span>
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
