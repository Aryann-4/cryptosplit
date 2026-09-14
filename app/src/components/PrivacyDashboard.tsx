export default function PrivacyDashboard() {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="label">How Your Privacy Works</h2>
      </div>

      <div className="space-y-1.5">
        {[
          {
            step: '01',
            title: 'Cryptographic Identity',
            desc: 'Your wallet address is hashed into a memberId using SHA-256. This hash is your identity in the group.',
            color: 'text-action',
            bg: 'bg-action/10',
          },
          {
            step: '02',
            title: 'ZK Debt Commitments',
            desc: 'Debts are committed as amount x secret. Only you know the mapping between your wallet and your debt.',
            color: 'text-mint',
            bg: 'bg-mint/10',
          },
          {
            step: '03',
            title: 'Settlement Without Exposure',
            desc: 'When you pay, you generate a ZK proof that you settled. No names, no wallet addresses on-chain.',
            color: 'text-action',
            bg: 'bg-action/10',
          },
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-3 p-3 rounded-md bg-shell-2 border border-shell-4">
            <div className={`w-7 h-7 rounded ${item.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`text-[10px] font-medium ${item.color}`}>{item.step}</span>
            </div>
            <div>
              <h4 className="text-xs font-medium text-cloud mb-0.5">{item.title}</h4>
              <p className="text-[11px] text-ash leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}

        <div className="p-3 rounded-md bg-action/5 border border-action/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="w-3 h-3 text-action" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="label !text-[9px] text-action">What an observer sees</span>
          </div>
          <p className="text-[11px] text-ash">
            A hash, a commitment value, and a proof. Nothing else.
          </p>
        </div>
      </div>
    </div>
  );
}
