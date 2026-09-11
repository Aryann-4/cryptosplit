import { useState } from 'react';
import { generateSecret, bytesToHex } from '../crypto.ts';

interface CircuitCallProps {
  connected: boolean;
  onCallCircuit: (circuit: string, args: Record<string, unknown>) => void;
  circuitResult: {
    status: 'idle' | 'proving' | 'submitting' | 'success' | 'error';
    txHash: string | null;
    error: string | null;
  };
  onReset: () => void;
}

export default function CircuitCall({ connected, onCallCircuit, circuitResult, onReset }: CircuitCallProps) {
  const [circuit, setCircuit] = useState<'addMember' | 'settle'>('addMember');
  const [memberSecret, setMemberSecret] = useState('');

  const handleCall = () => {
    if (circuit === 'addMember') {
      const secret = memberSecret || bytesToHex(generateSecret());
      onCallCircuit('add-member', { memberSecretHex: secret });
    } else {
      onCallCircuit('settle', {
        debtorSecretHex: bytesToHex(generateSecret()),
        creditorIdHex: bytesToHex(generateSecret()),
        amount: 100,
        creditorAddressHex: bytesToHex(generateSecret()),
      });
    }
  };

  const steps = [
    { label: 'Generate ZK Proof', done: circuitResult.status === 'success' || circuitResult.status === 'submitting' },
    { label: 'Submit to Chain', done: circuitResult.status === 'success' },
    { label: 'Verify', done: circuitResult.status === 'success' },
  ];

  return (
    <div className="glass p-6 space-y-5">
      <div>
        <h3 className="text-lg font-semibold gradient-text flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#4c6ef5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Call Circuit</span>
        </h3>
        <p className="text-sm text-surface-500 mt-1">Generate a ZK proof locally and submit it on-chain</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-400 mb-1.5">Circuit</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCircuit('addMember')}
            disabled={circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              circuit === 'addMember'
                ? 'border-[#4c6ef5] bg-[#4c6ef5]/10 text-[#818cf8]'
                : 'border-white/[0.06] text-surface-500 hover:border-white/[0.1]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>addMember</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setCircuit('settle')}
            disabled={circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              circuit === 'settle'
                ? 'border-[#4c6ef5] bg-[#4c6ef5]/10 text-[#818cf8]'
                : 'border-white/[0.06] text-surface-500 hover:border-white/[0.1]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>settle</span>
            </div>
          </button>
        </div>
      </div>

      {circuit === 'addMember' && (
        <div>
          <label className="block text-sm font-medium text-surface-400 mb-1.5">Member Secret</label>
          <input
            type="password"
            value={memberSecret}
            onChange={(e) => setMemberSecret(e.target.value)}
            placeholder="Leave blank to auto-generate"
            disabled={circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
            className="input-glass text-sm"
          />
          <div className="flex items-center space-x-1.5 mt-2">
            <svg className="w-3.5 h-3.5 text-[#4c6ef5]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-[#818cf8] font-medium">Proved without revealing your input</span>
          </div>
        </div>
      )}

      {(circuitResult.status === 'proving' || circuitResult.status === 'submitting' || circuitResult.status === 'success') && (
        <div className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.done ? 'bg-emerald-500' :
                  (i === 1 && circuitResult.status === 'submitting') || (i === 0 && circuitResult.status === 'proving')
                    ? 'bg-[#4c6ef5]' : 'bg-surface-700'
                }`}>
                  {step.done ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className={`w-3.5 h-3.5 text-white ${
                      (i === 1 && circuitResult.status === 'submitting') || (i === 0 && circuitResult.status === 'proving')
                        ? 'animate-spin' : ''
                    }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${step.done ? 'text-emerald-400 font-medium' : 'text-surface-500'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCall}
        disabled={!connected || circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {circuitResult.status === 'proving' ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Generating ZK Proof...</span>
          </>
        ) : circuitResult.status === 'submitting' ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Submitting to Chain...</span>
          </>
        ) : circuitResult.status === 'success' ? (
          <span>Call Again</span>
        ) : circuitResult.status === 'error' ? (
          <span>Retry</span>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Call Circuit</span>
          </>
        )}
      </button>

      {circuitResult.status === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2 animate-slide-up">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-emerald-400">Circuit called successfully!</p>
          </div>
          {circuitResult.txHash && (
            <p className="text-xs text-emerald-400/70 font-mono bg-emerald-500/10 rounded-lg px-3 py-1.5">
              TX: {circuitResult.txHash.slice(0, 32)}...
            </p>
          )}
          <button onClick={onReset} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Reset</button>
        </div>
      )}

      {circuitResult.status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-2 animate-slide-up">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-400">Circuit call failed</p>
          </div>
          <p className="text-xs text-red-400/70">{circuitResult.error}</p>
          <button onClick={onReset} className="text-xs text-red-400 hover:text-red-300 font-medium">Reset</button>
        </div>
      )}

      {!connected && (
        <div className="text-center py-3">
          <p className="text-sm text-surface-500 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Connect your wallet to call circuits</span>
          </p>
        </div>
      )}
    </div>
  );
}
