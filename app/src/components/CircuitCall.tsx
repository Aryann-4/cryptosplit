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

export default function CircuitCall({
  connected,
  onCallCircuit,
  circuitResult,
  onReset,
}: CircuitCallProps) {
  const [circuit, setCircuit] = useState<'addMember' | 'settle'>('addMember');
  const [memberSecret, setMemberSecret] = useState('');

  const handleCall = () => {
    if (circuit === 'addMember') {
      const secret = memberSecret
        ? memberSecret
        : bytesToHex(generateSecret());
      onCallCircuit('add-member', { memberSecretHex: secret });
    } else if (circuit === 'settle') {
      onCallCircuit('settle', {
        debtorSecretHex: bytesToHex(generateSecret()),
        creditorIdHex: bytesToHex(generateSecret()),
        amount: 100,
        creditorAddressHex: bytesToHex(generateSecret()),
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Call Circuit</h3>
        <p className="text-sm text-gray-500 mt-1">
          Generate a ZK proof locally and submit it on-chain.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Circuit
        </label>
        <select
          value={circuit}
          onChange={(e) => setCircuit(e.target.value as 'addMember' | 'settle')}
          disabled={circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-midnight-500"
        >
          <option value="addMember">addMember</option>
          <option value="settle">settle</option>
        </select>
      </div>

      {circuit === 'addMember' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member Secret (private — never sent to chain)
          </label>
          <input
            type="password"
            value={memberSecret}
            onChange={(e) => setMemberSecret(e.target.value)}
            placeholder="Leave blank to auto-generate"
            disabled={circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-midnight-500"
          />
          <p className="text-xs text-purple-600 mt-1 flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Proved without revealing your input</span>
          </p>
        </div>
      )}

      <button
        onClick={handleCall}
        disabled={!connected || circuitResult.status === 'proving' || circuitResult.status === 'submitting'}
        className="w-full bg-midnight-600 text-white py-2 rounded-lg font-medium hover:bg-midnight-700 disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        {circuitResult.status === 'proving' && (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Generating ZK Proof...</span>
          </>
        )}
        {circuitResult.status === 'submitting' && (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Submitting to Chain...</span>
          </>
        )}
        {circuitResult.status === 'idle' && <span>Call Circuit</span>}
        {circuitResult.status === 'success' && <span>Call Again</span>}
        {circuitResult.status === 'error' && <span>Retry</span>}
      </button>

      {circuitResult.status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-800">
              Circuit called successfully!
            </p>
          </div>
          {circuitResult.txHash && (
            <p className="text-xs text-green-700 font-mono">
              TX: {circuitResult.txHash.slice(0, 20)}...
            </p>
          )}
          <button
            onClick={onReset}
            className="text-xs text-green-600 hover:text-green-800 underline"
          >
            Reset
          </button>
        </div>
      )}

      {circuitResult.status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-800">Circuit call failed</p>
          </div>
          <p className="text-xs text-red-700">{circuitResult.error}</p>
          <button
            onClick={onReset}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Reset
          </button>
        </div>
      )}

      {!connected && (
        <p className="text-xs text-gray-400 text-center">
          Connect your Lace wallet to call circuits
        </p>
      )}
    </div>
  );
}
