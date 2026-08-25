import { useState } from 'react';
import { generateSecret, getMemberId, getDebtKey, bytesToHex } from '../crypto.ts';

interface PrivacyDemo {
  memberSecrets: Array<{ label: string; secret: string; memberId: string }>;
  debtExample: {
    debtorId: string;
    creditorId: string;
    debtKey: string;
    onChainVisible: string;
    onChainHidden: string;
  } | null;
}

export default function PrivacyDashboard() {
  const [demo, setDemo] = useState<PrivacyDemo>({
    memberSecrets: [],
    debtExample: null,
  });
  const [step, setStep] = useState(0);

  const runDemo = () => {
    if (step === 0) {
      const alice = generateSecret();
      const bob = generateSecret();
      const charlie = generateSecret();

      const members = [
        { label: 'Alice', secret: bytesToHex(alice), memberId: bytesToHex(getMemberId(alice)) },
        { label: 'Bob', secret: bytesToHex(bob), memberId: bytesToHex(getMemberId(bob)) },
        { label: 'Charlie', secret: bytesToHex(charlie), memberId: bytesToHex(getMemberId(charlie)) },
      ];

      setDemo({ memberSecrets: members, debtExample: null });
      setStep(1);
    } else if (step === 1) {
      const aliceSecret = generateSecret();
      const bobSecret = generateSecret();
      const aliceId = getMemberId(aliceSecret);
      const bobId = getMemberId(bobSecret);
      const debtKey = getDebtKey(aliceId, bobId);

      setDemo((d) => ({
        ...d,
        debtExample: {
          debtorId: bytesToHex(aliceId),
          creditorId: bytesToHex(bobId),
          debtKey: bytesToHex(debtKey),
          onChainVisible: bytesToHex(debtKey).slice(0, 32) + '...',
          onChainHidden: '??? No wallet address, no name, no amount ???',
        },
      }));
      setStep(2);
    } else {
      setStep(0);
      setDemo({ memberSecrets: [], debtExample: null });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Privacy Shield</h3>
          <p className="text-sm text-gray-500">
            Cryptographic commitment scheme — see what the blockchain sees
          </p>
        </div>
        <button
          onClick={runDemo}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            step === 0
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : step === 1
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {step === 0 ? 'Run Privacy Demo' : step === 1 ? 'Show Debt Commitment' : 'Reset'}
        </button>
      </div>

      {step >= 1 && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Step 1: Member Identity Commitments</h4>
            <p className="text-xs text-gray-500 mb-3">
              Each member generates a random <code className="bg-gray-200 px-1 rounded">secret</code>. Their on-chain identity
              is <code className="bg-gray-200 px-1 rounded">memberId = hash(secret)</code>. The secret is never stored on-chain.
            </p>
            <div className="space-y-2">
              {demo.memberSecrets.map((m, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white border rounded p-2">
                    <span className="text-gray-400">Name:</span>{' '}
                    <span className="font-medium">{m.label}</span>
                  </div>
                  <div className="bg-white border rounded p-2">
                    <span className="text-gray-400">Secret:</span>{' '}
                    <span className="font-mono text-red-600" title="NEVER on chain">
                      {m.secret.slice(0, 12)}...
                    </span>
                    <span className="ml-1 text-red-400 text-[10px]">SECRET (off-chain only)</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <span className="text-gray-400">memberId:</span>{' '}
                    <span className="font-mono text-green-700" title="On-chain commitment">
                      {m.memberId.slice(0, 12)}...
                    </span>
                    <span className="ml-1 text-green-500 text-[10px]">ON CHAIN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {step >= 2 && demo.debtExample && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Step 2: Debt Commitment (ZK Proof)</h4>
              <p className="text-xs text-gray-500 mb-3">
                When Alice owes Bob, the contract stores{' '}
                <code className="bg-gray-200 px-1 rounded">debtKey = hash(hash(domain, aliceId), bobId)</code>.
                No names, addresses, or amounts are stored on-chain.
              </p>
              <div className="space-y-2">
                <div className="bg-white border rounded p-2 text-xs">
                  <span className="text-gray-400">Alice&apos;s memberId:</span>{' '}
                  <span className="font-mono">{demo.debtExample.debtorId.slice(0, 20)}...</span>
                </div>
                <div className="bg-white border rounded p-2 text-xs">
                  <span className="text-gray-400">Bob&apos;s memberId:</span>{' '}
                  <span className="font-mono">{demo.debtExample.creditorId.slice(0, 20)}...</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs">
                  <span className="text-purple-600 font-medium">On-chain commitment (debtKey):</span>{' '}
                  <span className="font-mono text-purple-700">{demo.debtExample.debtKey.slice(0, 32)}...</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs">
                  <span className="text-red-600 font-medium">What an observer sees:</span>{' '}
                  <span className="text-red-400 italic">A meaningless hash — not Alice, not Bob, not the amount</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h4 className="font-medium text-purple-900">Commitment Scheme</h4>
            <p className="text-xs text-purple-700 mt-1">
              Member IDs are hashes, not wallet addresses
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-medium text-indigo-900">Domain Separation</h4>
            <p className="text-xs text-indigo-700 mt-1">
              Debt keys use separate domains to prevent collisions
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900">ZK Circuit Proofs</h4>
            <p className="text-xs text-gray-700 mt-1">
              Validity proven without revealing inputs
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
