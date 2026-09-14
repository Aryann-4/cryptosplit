export default function PrivacyDashboard() {
  return (
    <div className="glass p-6 border border-white/[0.06]">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">How Your Privacy Works</h2>
          <p className="text-xs text-surface-500">Zero-knowledge proofs keep your data private</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Step 1 */}
        <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/10 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-indigo-400">01</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Cryptographic Identity</h4>
            <p className="text-xs text-surface-500 leading-relaxed">
              Your wallet address is hashed into a <code className="text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">memberId</code> using SHA-256. This hash is your identity in the group.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-purple-500/10 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-purple-400">02</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">ZK Debt Commitments</h4>
            <p className="text-xs text-surface-500 leading-relaxed">
              Debts are committed as <code className="text-purple-400 bg-purple-500/10 px-1 py-0.5 rounded">amount × secret</code>. Only you know the mapping between your wallet and your debt.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-emerald-500/10 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-emerald-400">03</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Settlement Without Exposure</h4>
            <p className="text-xs text-surface-500 leading-relaxed">
              When you pay, you generate a ZK proof that you settled. No names, no wallet addresses, no payment history on-chain.
            </p>
          </div>
        </div>

        {/* Observer View */}
        <div className="p-4 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/10">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm font-semibold text-indigo-400">What an observer sees</span>
          </div>
          <p className="text-xs text-surface-500">
            A hash, a commitment value, and a proof. Nothing else. You cannot determine who owes whom, how much, or whether any real money changed hands.
          </p>
        </div>
      </div>
    </div>
  );
}
