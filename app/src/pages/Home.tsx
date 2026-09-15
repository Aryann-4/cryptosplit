import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.tsx';
import PrivacyDashboard from '../components/PrivacyDashboard.tsx';
import CountUp from '../components/CountUp.tsx';
import { useWallet, createGroupLocal } from '../hooks/useWallet.ts';
import { createGroup, getAllGroups } from '../store.ts';

export default function Home() {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [memberInputs, setMemberInputs] = useState<string[]>(['']);

  const addMemberInput = () => setMemberInputs([...memberInputs, '']);
  const updateMemberInput = (index: number, value: string) => {
    const updated = [...memberInputs];
    updated[index] = value;
    setMemberInputs(updated);
  };
  const removeMemberInput = (index: number) => {
    if (memberInputs.length > 1) setMemberInputs(memberInputs.filter((_, i) => i !== index));
  };

  const handleCreateGroup = () => {
    if (!wallet.coinPublicKeyBytes) return;
    const validLabels = memberInputs.filter((l) => l.trim());
    const group = createGroupLocal(wallet.coinPublicKeyBytes, validLabels);
    createGroup(group);
    setShowCreate(false);
    setMemberInputs(['']);
    navigate(`/group/${group.contractAddress}`);
  };

  const groups = getAllGroups();

  return (
    <div className="space-y-8">
      {!wallet.connected ? (
        <div className="space-y-8">
          {/* Hero */}
          <div className="glass p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden animate-blur-focus">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gold/[0.06] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-accent/[0.05] rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-subtle mb-8 animate-slide-up delay-1 animate-border-glow">
                <span className="w-2 h-2 bg-mint rounded-full animate-pulse" />
                <span className="label !text-[10px] !tracking-[0.15em]">Live on Midnight Preprod</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-[1.1] animate-slide-up delay-2">
                <span className="text-white">Split expenses.</span>
                <br />
                <span className="gradient-text">Keep them private.</span>
              </h1>

              <p className="text-base sm:text-lg text-ash max-w-lg mx-auto mb-10 leading-relaxed animate-slide-up delay-3">
                Zero-knowledge bill splitting on Midnight Network. Your wallet address, names, and spending habits never touch the blockchain.
              </p>

              <div className="flex justify-center mb-12 animate-slide-up delay-4">
                <WalletConnect
                  onConnect={wallet.connect}
                  connected={wallet.connected}
                  connecting={wallet.connecting}
                  address={wallet.address}
                  shieldedAddress={wallet.shieldedAddress}
                  onDisconnect={wallet.disconnect}
                  error={wallet.error}
                />
              </div>

              <div className="flex justify-center gap-12 sm:gap-16 animate-slide-up delay-5">
                {[
                  { value: 0, label: 'Addresses On-Chain', isNumber: true },
                  { value: 'ZK', label: 'Proofs Generated', isNumber: false },
                  { value: 100, label: '% Private', isNumber: true },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {stat.isNumber ? (
                        <CountUp target={stat.value as number} duration={1200} suffix={stat.label.includes('%') ? '%' : ''} />
                      ) : (
                        <span className="text-shimmer">{stat.value}</span>
                      )}
                    </div>
                    <div className="label !text-[9px] mt-1">{stat.label.includes('%') ? '' : stat.label}</div>
                    {stat.label.includes('%') && <div className="label !text-[9px] mt-1">Private</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="animate-slide-up delay-3">
            <h2 className="label mb-5">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-grid">
              {[
                {
                  step: '01',
                  title: 'Connect Wallet',
                  desc: 'Connect your Midnight Lace wallet. Your address stays private.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Create Group',
                  desc: 'Add members. Each gets a cryptographic identity hash.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Settle with ZK',
                  desc: 'Prove you paid without revealing who you are.',
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="glass p-6 tilt-card hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="mono-data text-gold">{item.step}</span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold/20 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all duration-300">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-ash leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-slide-up delay-4">
            <PrivacyDashboard />
          </div>
        </div>
      ) : (
        <>
          {/* Connected Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
            <div>
              <h1 className="text-xl font-bold text-white">Your Groups</h1>
              <p className="mono-data text-[11px] mt-1">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <WalletConnect
                onConnect={wallet.connect}
                connected={wallet.connected}
                connecting={wallet.connecting}
                address={wallet.address}
                shieldedAddress={wallet.shieldedAddress}
                onDisconnect={wallet.disconnect}
                error={wallet.error}
              />
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                + New Group
              </button>
            </div>
          </div>

          {/* Create Modal */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass w-full max-w-md p-6 animate-scale-in">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-white">New Group</h2>
                  <button onClick={() => { setShowCreate(false); setMemberInputs(['']); }} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-ash hover:text-white hover:bg-white/[0.08] transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2.5 mb-4">
                  {memberInputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2.5 animate-slide-left" style={{ animationDelay: `${index * 0.05}s` }}>
                      <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <span className="mono-data text-[10px] text-gold">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => updateMemberInput(index, e.target.value)}
                        placeholder={`Member ${index + 1}`}
                        className="input-glass flex-1"
                        autoFocus={index === memberInputs.length - 1}
                      />
                      {memberInputs.length > 1 && (
                        <button onClick={() => removeMemberInput(index)} className="text-ash hover:text-red-400 transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={addMemberInput} className="w-full border border-dashed border-white/[0.08] rounded-xl py-2.5 text-sm text-ash hover:text-gold hover:border-gold/30 transition-all mb-5 hover:scale-[1.01]">
                  + Add Member
                </button>

                <div className="flex gap-3">
                  <button onClick={handleCreateGroup} disabled={!memberInputs.some((l) => l.trim())} className="btn-primary flex-1 disabled:opacity-40">Create Group</button>
                  <button onClick={() => { setShowCreate(false); setMemberInputs(['']); }} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Groups Grid */}
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid">
              {groups.map((group) => (
                <button
                  key={group.contractAddress}
                  onClick={() => navigate(`/group/${group.contractAddress}`)}
                  className="glass p-5 text-left tilt-card hover:border-white/[0.12] transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-shadow duration-300 group-hover:scale-110">
                      <span className="text-white font-bold">{group.members.length}</span>
                    </div>
                    <svg className="w-5 h-5 text-surface-4 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">Expense Group</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ash">{group.members.length} members</span>
                    <span className="mono-data text-[10px]">{group.contractAddress.slice(0, 8)}...</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="glass text-center py-16 animate-blur-focus">
              <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4 pulse-glow animate-border-glow">
                <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm text-ash mb-4">No groups yet</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary">
                Create your first group
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
