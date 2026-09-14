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
    <div className="card">
      <h3 className="label mb-3">Circuit Call</h3>

      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1">
          {CIRCUITS.map((circuit) => (
            <button
              key={circuit.id}
              onClick={() => { setSelectedCircuit(circuit); setArgs({}); onReset(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                selectedCircuit.id === circuit.id
                  ? 'bg-action/10 border border-action/30 text-action'
                  : 'bg-shell-2 border border-shell-4 text-ash hover:text-slate'
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
            className="input-shell text-xs"
          />
        ))}

        <button
          onClick={handleCall}
          disabled={circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
          className="btn-primary w-full disabled:opacity-40"
        >
          {circuitResult.status === 'proving' ? 'Generating...' : circuitResult.status === 'submitting' ? 'Submitting...' : 'Call Circuit'}
        </button>

        {circuitResult.status === 'success' && circuitResult.txHash && (
          <div className="p-2.5 rounded-md bg-mint/5 border border-mint/20">
            <p className="text-xs text-mint font-medium">Success</p>
            <p className="mono-data text-[10px] mt-1 break-all">{circuitResult.txHash}</p>
          </div>
        )}

        {circuitResult.status === 'error' && (
          <div className="p-2.5 rounded-md bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-red-400 font-medium">Error</p>
            <p className="mono-data text-[10px] mt-1">{circuitResult.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
