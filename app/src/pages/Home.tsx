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

  const addMemberInput = () => {
    setMemberInputs([...memberInputs, '']);
  };

  const updateMemberInput = (index: number, value: string) => {
    const updated = [...memberInputs];
    updated[index] = value;
    setMemberInputs(updated);
  };

  const removeMemberInput = (index: number) => {
    if (memberInputs.length > 1) {
      setMemberInputs(memberInputs.filter((_, i) => i !== index));
    }
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
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#12121a] via-[#1a1a2e] to-[#0a0a0f]">
            {/* Animated Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#4c6ef5]/20 rounded-full blur-[100px] animate-blob"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#7c3aed]/20 rounded-full blur-[100px] animation-delay-2000 animate-blob"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#a855f7]/10 rounded-full blur-[80px] animation-delay-4000 animate-blob"></div>
            </div>

            <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
              {/* Status Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] rounded-full px-4 py-1.5 mb-8">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-surface-300 text-xs font-medium tracking-wide">LIVE ON MIDNIGHT PREPROD</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="gradient-text">Split Expenses</span>
                <br />
                <span className="gradient-text-accent">Keep Privacy</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Zero-knowledge bill splitting on Midnight Network.
                <br className="hidden sm:inline" />
                Your wallet address never touches the blockchain.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-accent mb-1">0</div>
                  <div className="text-[11px] text-surface-500 uppercase tracking-widest">Addresses On-Chain</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-accent mb-1">ZK</div>
                  <div className="text-[11px] text-surface-500 uppercase tracking-widest">Proofs Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-accent mb-1">100%</div>
                  <div className="text-[11px] text-surface-500 uppercase tracking-widest">Private By Default</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-6 glass-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4c6ef5] to-[#4c6ef5]/50 flex items-center justify-center mb-4 shadow-lg shadow-[#4c6ef5]/20 group-hover:shadow-[#4c6ef5]/40 transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Zero-Knowledge Identity</h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Your on-chain identity is a commitment hash. The blockchain never sees your wallet address or real name.
              </p>
            </div>

            <div className="glass p-6 glass-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#7c3aed]/50 flex items-center justify-center mb-4 shadow-lg shadow-[#7c3aed]/20 group-hover:shadow-[#7c3aed]/40 transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Domain-Separated Keys</h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Debt relationships use domain-separated hashes. Observers see random data, not who owes whom.
              </p>
            </div>

            <div className="glass p-6 glass-hover transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#a855f7]/50 flex items-center justify-center mb-4 shadow-lg shadow-[#a855f7]/20 group-hover:shadow-[#a855f7]/40 transition-shadow">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">ZK-Settled Payments</h3>
              <p className="text-sm text-surface-400 leading-relaxed">
                Settlement proves you authorized payment without revealing who you are. Only hashes on-chain.
              </p>
            </div>
          </div>

          <PrivacyDashboard />
        </div>
      ) : (
        <>
          {/* Connected Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Your Groups</h1>
              <p className="text-sm text-surface-500 mt-1">
                {groups.length} group{groups.length !== 1 ? 's' : ''} created
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
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Group</span>
              </button>
            </div>
          </div>

          {/* Create Group Modal */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass w-full max-w-md p-6 space-y-4 animate-slide-up border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold gradient-text">Create New Group</h2>
                  <button
                    onClick={() => { setShowCreate(false); setMemberInputs(['']); }}
                    className="text-surface-500 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-surface-400">
                  Add member names. Each gets a cryptographic identity.
                </p>

                <div className="space-y-2">
                  {memberInputs.map((input, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                        <span className="text-surface-400 text-sm font-medium">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => updateMemberInput(index, e.target.value)}
                        placeholder={`Member ${index + 1} name`}
                        className="input-glass flex-1"
                        autoFocus={index === memberInputs.length - 1}
                      />
                      {memberInputs.length > 1 && (
                        <button
                          onClick={() => removeMemberInput(index)}
                          className="text-surface-600 hover:text-red-400 transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addMemberInput}
                  className="w-full border border-dashed border-white/[0.08] rounded-xl py-2.5 text-sm text-surface-500 hover:border-[#4c6ef5]/50 hover:text-[#4c6ef5] transition-all flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Member</span>
                </button>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleCreateGroup}
                    disabled={!memberInputs.some((l) => l.trim())}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setMemberInputs(['']); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Groups Grid */}
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <button
                  key={group.contractAddress}
                  onClick={() => navigate(`/group/${group.contractAddress}`)}
                  className="glass p-6 text-left glass-hover transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4c6ef5] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-[#4c6ef5]/20 group-hover:shadow-[#4c6ef5]/40 transition-shadow">
                      <span className="text-white font-bold text-lg">{group.members.length}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Expense Group</p>
                      <p className="text-xs text-surface-500">
                        {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-surface-400">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-surface-600 font-mono">
                      {group.contractAddress.slice(0, 8)}...
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No groups yet</h3>
              <p className="text-surface-500 mb-4">Create your first expense group to get started</p>
              <button
                onClick={() => setShowCreate(true)}
                className="text-[#4c6ef5] hover:text-[#748ffc] font-medium text-sm transition-colors"
              >
                Create your first group
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
