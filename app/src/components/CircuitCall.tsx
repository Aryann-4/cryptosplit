import { useState } from 'react';

interface CircuitCallProps {
  connected: boolean;
  onCallCircuit: (circuit: string, args: Record<string, unknown>) => void;
  circuitResult: { status: 'idle' | 'proving' | 'submitting' | 'success' | 'error'; txHash: string | null; error: string | null };
  onReset: () => void;
}

const CIRCUITS = [
  { id: 'add-member', label: 'Add Member', args: [{ key: 'memberSecretHex', placeholder: 'Secret hex' }] },
  { id: 'settle', label: 'Settle', args: [{ key: 'amount', placeholder: 'Amount' }] },
  { id: 'set-net-debt', label: 'Set Net Debt', args: [{ key: 'amount', placeholder: 'Amount' }] },
  { id: 'transfer-organizer', label: 'Transfer Organizer', args: [{ key: 'newOrganizerHex', placeholder: 'New organizer hex' }] },
];

export default function CircuitCall({ connected, onCallCircuit, circuitResult, onReset }: CircuitCallProps) {
  const [selectedCircuit, setSelectedCircuit] = useState(CIRCUITS[0]);
  const [args, setArgs] = useState<Record<string, string>>({});

  const handleCall = () => {
    const parsed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(args)) {
      parsed[k] = k === 'amount' ? Number(v) : v;
    }
    onCallCircuit(selectedCircuit.id, parsed);
  };

  return (
    <div className="glass p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Circuit Call</span>
      </h3>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {CIRCUITS.map((circuit) => (
            <button
              key={circuit.id}
              onClick={() => { setSelectedCircuit(circuit); setArgs({}); onReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCircuit.id === circuit.id
                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                  : 'bg-white/[0.02] border border-white/[0.04] text-surface-500 hover:text-surface-300'
              }`}
            >
              {circuit.label}
            </button>
          ))}
        </div>

        {selectedCircuit.args.map((arg) => (
          <input
            key={arg.key}
            type="text"
            value={args[arg.key] || ''}
            onChange={(e) => setArgs({ ...args, [arg.key]: e.target.value })}
            placeholder={arg.placeholder}
            className="input-glass w-full text-xs"
          />
        ))}

        <button
          onClick={handleCall}
          disabled={circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
          className="btn-primary w-full disabled:opacity-40"
        >
          {circuitResult.status === 'proving' ? 'Generating Proof...' : circuitResult.status === 'submitting' ? 'Submitting...' : 'Call Circuit'}
        </button>

        {circuitResult.status === 'success' && circuitResult.txHash && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
            <p className="text-emerald-400 font-medium">Success</p>
            <p className="text-xs text-surface-500 mt-1 font-mono">{circuitResult.txHash}</p>
          </div>
        )}

        {circuitResult.status === 'error' && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm">
            <p className="text-red-400 font-medium">Error</p>
            <p className="text-xs text-surface-500 mt-1">{circuitResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
