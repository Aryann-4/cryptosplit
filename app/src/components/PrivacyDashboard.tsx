import { useState } from 'react';
import { generateSecret, getMemberId, getDebtKey, bytesToHex } from '../crypto.ts';

interface PrivacyDemo {
  memberSecrets: Array<{ label: string; secret: string; memberId: string }>;
  debtExample: {
    debtorId: string;
    creditorId: string;
    debtKey: string;
    domain: string;
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
          domain: bytesToHex(new Uint8Array(32)).slice(0, 16),
        },
      }));
      setStep(2);
    } else {
      setStep(0);
      setDemo({ memberSecrets: [], debtExample: null });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Privacy Shield</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Interactive demo — see what the blockchain actually sees
          </p>
        </div>
        <button
          onClick={runDemo}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
            step === 0
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
              : step === 1
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                : 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm'
          }`}
        >
          {step === 0 ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Run Demo</span>
            </>
          ) : step === 1 ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span>Next Step</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </>
          )}
        </button>
      </div>

      {/* Step 1: Member Commitments */}
      {step >= 1 && (
        <div className="space-y-4 animate-in">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <h4 className="text-sm font-semibold text-purple-900">Member Identity Commitments</h4>
            </div>
            <p className="text-xs text-purple-700 mb-4">
              Each member generates a random <code className="bg-white/60 px-1.5 py-0.5 rounded font-mono">secret</code>. Their on-chain identity
              is <code className="bg-white/60 px-1.5 py-0.5 rounded font-mono">memberId = hash(secret)</code>. The secret never touches the blockchain.
            </p>
            <div className="space-y-2">
              {demo.memberSecrets.map((m, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="bg-white border border-purple-100 rounded-lg p-2.5 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-700 text-xs font-bold">{m.label.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-gray-700">{m.label}</span>
                  </div>
                  <div className="bg-white border border-red-200 rounded-lg p-2.5">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-3 h-3 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-mono text-red-600">{m.secret.slice(0, 16)}...</span>
                    </div>
                    <span className="text-red-400 text-[10px] ml-4">SECRET — off-chain only</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-mono text-green-700">{m.memberId.slice(0, 16)}...</span>
                    </div>
                    <span className="text-green-500 text-[10px] ml-4">ON CHAIN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flow Arrow */}
          {step >= 2 && (
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300"></div>
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Debt Commitment */}
      {step >= 2 && demo.debtExample && (
        <div className="space-y-4 animate-in">
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-5 border border-indigo-100">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <h4 className="text-sm font-semibold text-indigo-900">Debt Commitment (Domain-Separated Key)</h4>
            </div>
            <p className="text-xs text-indigo-700 mb-4">
              When Alice owes Bob, the contract stores a domain-separated hash.
              No names, addresses, or amounts are stored on-chain.
            </p>

            {/* Visual Flow */}
            <div className="bg-white rounded-xl p-4 border border-indigo-100 space-y-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500 w-20 flex-shrink-0">Alice's ID:</span>
                <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">{demo.debtExample.debtorId.slice(0, 24)}...</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500 w-20 flex-shrink-0">Bob's ID:</span>
                <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">{demo.debtExample.creditorId.slice(0, 24)}...</span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-indigo-500 w-20 flex-shrink-0 font-medium">debtKey:</span>
                  <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">{demo.debtExample.debtKey.slice(0, 32)}...</span>
                </div>
              </div>
            </div>

            {/* What Observer Sees */}
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">What an observer sees on-chain:</p>
                  <p className="text-xs text-red-600 font-mono">A meaningless hash — not Alice, not Bob, not the amount, not who paid.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idle State: Feature Cards */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-100 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-purple-900 mb-1">Commitment Scheme</h4>
            <p className="text-xs text-purple-700 leading-relaxed">
              Member IDs are cryptographic hashes, not wallet addresses
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-5 border border-indigo-100 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-semibold text-indigo-900 mb-1">Domain Separation</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Debt keys use separate domains to prevent collision attacks
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-5 border border-violet-100 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center mb-3 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-violet-900 mb-1">ZK Circuit Proofs</h4>
            <p className="text-xs text-violet-700 leading-relaxed">
              Validity is proven without revealing any inputs
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
