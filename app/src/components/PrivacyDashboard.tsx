import { useState } from 'react';
import { generateSecret, getMemberId, getDebtKey, bytesToHex } from '../crypto.ts';

interface PrivacyDemo {
  memberSecrets: Array<{ label: string; secret: string; memberId: string }>;
  debtExample: {
    debtorId: string;
    creditorId: string;
    debtKey: string;
  } | null;
}

export default function PrivacyDashboard() {
  const [demo, setDemo] = useState<PrivacyDemo>({ memberSecrets: [], debtExample: null });
  const [step, setStep] = useState(0);

  const runDemo = () => {
    if (step === 0) {
      const alice = generateSecret();
      const bob = generateSecret();
      const charlie = generateSecret();

      setDemo({
        memberSecrets: [
          { label: 'Alice', secret: bytesToHex(alice), memberId: bytesToHex(getMemberId(alice)) },
          { label: 'Bob', secret: bytesToHex(bob), memberId: bytesToHex(getMemberId(bob)) },
          { label: 'Charlie', secret: bytesToHex(charlie), memberId: bytesToHex(getMemberId(charlie)) },
        ],
        debtExample: null,
      });
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
        },
      }));
      setStep(2);
    } else {
      setStep(0);
      setDemo({ memberSecrets: [], debtExample: null });
    }
  };

  return (
    <div className="glass p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold gradient-text flex items-center space-x-2">
            <svg className="w-5 h-5 text-[#4c6ef5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Privacy Shield</span>
          </h3>
          <p className="text-sm text-surface-500 mt-1">Interactive demo — see what the blockchain actually sees</p>
        </div>
        <button
          onClick={runDemo}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
            step === 0
              ? 'btn-primary'
              : step === 1
                ? 'bg-[#7c3aed] text-white hover:bg-[#7c3aed]/80'
                : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
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

      {/* Step 1 */}
      {step >= 1 && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-gradient-to-r from-[#4c6ef5]/10 to-[#7c3aed]/10 rounded-2xl p-5 border border-[#4c6ef5]/20">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-[#4c6ef5] rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              <h4 className="text-sm font-semibold text-[#818cf8]">Member Identity Commitments</h4>
            </div>
            <p className="text-xs text-surface-400 mb-4">
              Each member generates a random <code className="bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">secret</code>. Their on-chain identity is <code className="bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">memberId = hash(secret)</code>.
            </p>
            <div className="space-y-2">
              {demo.memberSecrets.map((m, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-[#4c6ef5]/20 flex items-center justify-center">
                      <span className="text-[#4c6ef5] text-xs font-bold">{m.label.charAt(0)}</span>
                    </div>
                    <span className="font-medium text-surface-300">{m.label}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-red-500/20 rounded-xl p-2.5">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-3 h-3 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-mono text-red-400">{m.secret.slice(0, 16)}...</span>
                    </div>
                    <span className="text-red-400/50 text-[10px] ml-4">SECRET — off-chain only</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                    <div className="flex items-center space-x-1.5">
                      <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-mono text-emerald-400">{m.memberId.slice(0, 16)}...</span>
                    </div>
                    <span className="text-emerald-400/50 text-[10px] ml-4">ON CHAIN</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {step >= 2 && (
            <div className="flex justify-center">
              <div className="w-px h-4 bg-surface-700"></div>
            </div>
          )}
        </div>
      )}

      {/* Step 2 */}
      {step >= 2 && demo.debtExample && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#a855f7]/10 rounded-2xl p-5 border border-[#7c3aed]/20">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-[#7c3aed] rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              <h4 className="text-sm font-semibold text-[#a78bfa]">Debt Commitment (Domain-Separated Key)</h4>
            </div>
            <p className="text-xs text-surface-400 mb-4">When Alice owes Bob, the contract stores a domain-separated hash. No names, addresses, or amounts on-chain.</p>

            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] space-y-3">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-surface-500 w-20 flex-shrink-0">Alice's ID:</span>
                <span className="font-mono text-surface-300 bg-white/[0.03] px-2 py-1 rounded">{demo.debtExample.debtorId.slice(0, 24)}...</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-surface-500 w-20 flex-shrink-0">Bob's ID:</span>
                <span className="font-mono text-surface-300 bg-white/[0.03] px-2 py-1 rounded">{demo.debtExample.creditorId.slice(0, 24)}...</span>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#818cf8] w-20 flex-shrink-0 font-medium">debtKey:</span>
                  <span className="font-mono text-[#818cf8] bg-[#4c6ef5]/10 px-2 py-1 rounded border border-[#4c6ef5]/20">{demo.debtExample.debtKey.slice(0, 32)}...</span>
                </div>
              </div>
            </div>

            <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400 mb-1">What an observer sees on-chain:</p>
                  <p className="text-xs text-red-400/70 font-mono">A meaningless hash — not Alice, not Bob, not the amount, not who paid.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idle State */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#4c6ef5]/10 to-[#4c6ef5]/5 rounded-2xl p-5 border border-[#4c6ef5]/20 hover:border-[#4c6ef5]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#4c6ef5] flex items-center justify-center mb-3 shadow-lg shadow-[#4c6ef5]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white mb-1">Commitment Scheme</h4>
            <p className="text-xs text-surface-400 leading-relaxed">Member IDs are cryptographic hashes, not wallet addresses</p>
          </div>
          <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#7c3aed]/5 rounded-2xl p-5 border border-[#7c3aed]/20 hover:border-[#7c3aed]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center mb-3 shadow-lg shadow-[#7c3aed]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white mb-1">Domain Separation</h4>
            <p className="text-xs text-surface-400 leading-relaxed">Debt keys use separate domains to prevent collision attacks</p>
          </div>
          <div className="bg-gradient-to-br from-[#a855f7]/10 to-[#a855f7]/5 rounded-2xl p-5 border border-[#a855f7]/20 hover:border-[#a855f7]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#a855f7] flex items-center justify-center mb-3 shadow-lg shadow-[#a855f7]/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white mb-1">ZK Circuit Proofs</h4>
            <p className="text-xs text-surface-400 leading-relaxed">Validity is proven without revealing any inputs</p>
          </div>
        </div>
      )}
    </div>
  );
}
