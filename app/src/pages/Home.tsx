import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.tsx';
import PrivacyDashboard from '../components/PrivacyDashboard.tsx';
import { useWallet, createGroupLocal } from '../hooks/useWallet.ts';
import { createGroup, getAllGroups } from '../store.ts';
import { bytesToHex } from '../crypto.ts';

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
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06]">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f1a] via-[#141425] to-[#0a0a12]"></div>
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.07] rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[100px]"></div>
            </div>

            <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              <div className="max-w-2xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 mb-6">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-surface-400 tracking-wide">LIVE ON MIDNIGHT PREPROD</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                  <span className="text-white">Split expenses.</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
                    Keep them private.
                  </span>
                </h1>

                <p className="text-surface-400 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                  Zero-knowledge bill splitting on Midnight Network. Your wallet address, names, and spending habits never touch the blockchain.
                </p>

                {/* CTA */}
                <div className="flex flex-col items-center gap-4">
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

                {/* Stats Row */}
                <div className="mt-12 flex justify-center gap-12 sm:gap-16">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">0</div>
                    <div className="text-[11px] text-surface-500 uppercase tracking-widest font-medium">Addresses On-Chain</div>
                  </div>
                  <div className="w-px bg-white/[0.08]"></div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">ZK</div>
                    <div className="text-[11px] text-surface-500 uppercase tracking-widest font-medium">Proofs Generated</div>
                  </div>
                  <div className="w-px bg-white/[0.08]"></div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-[11px] text-surface-500 uppercase tracking-widest font-medium">Private</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">How it works</h2>
              <p className="text-surface-500">Three steps to private bill splitting</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  step: '01',
                  title: 'Connect Wallet',
                  desc: 'Connect your Midnight Lace wallet. Your address stays private.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Create Group',
                  desc: 'Add members. Each gets a cryptographic identity hash.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Settle with ZK',
                  desc: 'Prove you paid without revealing who you are.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="glass p-6 group hover:border-white/[0.1] transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">{item.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-surface-400 group-hover:text-indigo-400 group-hover:border-indigo-500/20 group-hover:bg-indigo-500/10 transition-all">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <PrivacyDashboard />
        </div>
      ) : (
        <>
          {/* Connected Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Your Groups</h1>
              <p className="text-sm text-surface-500 mt-1">
                {groups.length} group{groups.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <WalletConnect
                onConnect={wallet.connect}
                connected={wallet.connected}
                connecting={wallet.connecting}
                address={wallet.address}
                shieldedAddress={wallet.shieldedAddress}
                onDisconnect={wallet.disconnect}
                error={wallet.error}
              />
              <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Group</span>
              </button>
            </div>
          </div>

          {/* Create Group Modal */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass w-full max-w-md p-6 space-y-5 border border-white/[0.08] animate-slide-up">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">New Group</h2>
                  <button onClick={() => { setShowCreate(false); setMemberInputs(['']); }} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-surface-500 hover:text-white hover:bg-white/[0.08] transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  {memberInputs.map((input, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                        <span className="text-surface-500 text-sm">{index + 1}</span>
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
                        <button onClick={() => removeMemberInput(index)} className="text-surface-600 hover:text-red-400 transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={addMemberInput} className="w-full border border-dashed border-white/[0.08] rounded-xl py-2.5 text-sm text-surface-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-all flex items-center justify-center space-x-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Member</span>
                </button>

                <div className="flex space-x-3">
                  <button onClick={handleCreateGroup} disabled={!memberInputs.some((l) => l.trim())} className="btn-primary flex-1 disabled:opacity-40">Create</button>
                  <button onClick={() => { setShowCreate(false); setMemberInputs(['']); }} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Groups */}
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <button
                  key={group.contractAddress}
                  onClick={() => navigate(`/group/${group.contractAddress}`)}
                  className="glass p-5 text-left hover:border-white/[0.1] transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <span className="text-white font-bold">{group.members.length}</span>
                    </div>
                    <svg className="w-4 h-4 text-surface-600 group-hover:text-surface-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white mb-1">Expense Group</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-500">{group.members.length} members</span>
                    <span className="text-xs text-surface-600 font-mono">{group.contractAddress.slice(0, 8)}...</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">No groups yet</h3>
              <p className="text-surface-500 text-sm mb-4">Create your first expense group to get started</p>
              <button onClick={() => setShowCreate(true)} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">Create your first group</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
