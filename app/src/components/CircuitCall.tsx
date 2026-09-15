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
  { id: 'transfer-organizer', label: 'Transfer Org', args: [{ key: 'newOrganizerHex', placeholder: 'New organizer' }] },
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
      <h3 className="label mb-4">Circuit Call</h3>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {CIRCUITS.map((circuit) => (
            <button
              key={circuit.id}
              onClick={() => { setSelectedCircuit(circuit); setArgs({}); onReset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCircuit.id === circuit.id
                  ? 'bg-accent text-white shadow-glow-accent'
                  : 'bg-white/[0.04] border border-white/[0.06] text-ash hover:text-white hover:bg-white/[0.06]'
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
            className="input-glass text-sm"
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
          <div className="glass-subtle p-3 border-mint/20">
            <p className="text-sm text-mint font-medium">Success</p>
            <p className="mono-data text-[10px] mt-1 break-all">{circuitResult.txHash}</p>
          </div>
        )}

        {circuitResult.status === 'error' && (
          <div className="glass-subtle p-3 border-red-500/20">
            <p className="text-sm text-red-400 font-medium">Error</p>
            <p className="mono-data text-[10px] mt-1">{circuitResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
