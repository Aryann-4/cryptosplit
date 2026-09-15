export default function PrivacyDashboard() {
  return (
    <div className="glass p-6 animate-slide-up">
      <h2 className="label mb-5">How Your Privacy Works</h2>

      <div className="space-y-2">
        {[
          {
            step: '01',
            title: 'Cryptographic Identity',
            desc: 'Your wallet address is hashed into a memberId using SHA-256. This hash is your identity in the group.',
            color: 'text-accent',
            bg: 'bg-accent/10',
            border: 'border-accent/20',
          },
          {
            step: '02',
            title: 'ZK Debt Commitments',
            desc: 'Debts are committed as amount x secret. Only you know the mapping between your wallet and your debt.',
            color: 'text-blue',
            bg: 'bg-blue/10',
            border: 'border-blue/20',
          },
          {
            step: '03',
            title: 'Settlement Without Exposure',
            desc: 'When you pay, you generate a ZK proof that you settled. No names, no wallet addresses on-chain.',
            color: 'text-mint',
            bg: 'bg-mint/10',
            border: 'border-mint/20',
          },
        ].map((item, i) => (
          <div
            key={item.step}
            className="glass-subtle p-4 hover:border-white/[0.1] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-8 h-8 rounded-lg ${item.bg} border ${item.border} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-[10px] font-medium ${item.color}`}>{item.step}</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-ash leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="glass-subtle p-4 border-accent/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[150px] h-[150px] bg-accent/[0.04] rounded-full blur-[50px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="label !text-[9px] text-accent">What an observer sees</span>
            </div>
            <p className="text-xs text-ash">
              A hash, a commitment value, and a proof. Nothing else. You cannot determine who owes whom, how much, or whether any real money changed hands.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
