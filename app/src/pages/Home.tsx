import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.tsx';
import PrivacyDashboard from '../components/PrivacyDashboard.tsx';
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
    <div className="space-y-6">
      {!wallet.connected ? (
        <div className="space-y-6">
          {/* Hero */}
          <div className="card p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-shell-4 bg-shell-2 mb-6">
              <span className="w-1.5 h-1.5 bg-mint rounded-full" />
              <span className="label !text-[10px]">Live on Midnight Preprod</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-cloud mb-3">
              Split expenses.
              <br />
              <span className="text-action">Keep them private.</span>
            </h1>

            <p className="text-sm text-ash max-w-md mx-auto mb-8 leading-relaxed">
              Zero-knowledge bill splitting on Midnight Network. Your wallet address, names, and spending habits never touch the blockchain.
            </p>

            <WalletConnect
              onConnect={wallet.connect}
              connected={wallet.connected}
              connecting={wallet.connecting}
              address={wallet.address}
              shieldedAddress={wallet.shieldedAddress}
              onDisconnect={wallet.disconnect}
              error={wallet.error}
            />

            {/* Stats */}
            <div className="mt-10 flex justify-center gap-10">
              {[
                { value: '0', label: 'Addresses On-Chain' },
                { value: 'ZK', label: 'Proofs Generated' },
                { value: '100%', label: 'Private' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-semibold text-cloud">{stat.value}</div>
                  <div className="label !text-[9px] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h2 className="label mb-4">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { step: '01', title: 'Connect Wallet', desc: 'Connect your Midnight Lace wallet. Your address stays private.' },
                { step: '02', title: 'Create Group', desc: 'Add members. Each gets a cryptographic identity hash.' },
                { step: '03', title: 'Settle with ZK', desc: 'Prove you paid without revealing who you are.' },
              ].map((item) => (
                <div key={item.step} className="card hover:border-shell-5 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="mono-data text-action">{item.step}</span>
                    <div className="h-px flex-1 bg-shell-4" />
                  </div>
                  <h3 className="text-sm font-medium text-cloud mb-1">{item.title}</h3>
                  <p className="text-xs text-ash leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <PrivacyDashboard />
        </div>
      ) : (
        <>
          {/* Connected Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-cloud">Your Groups</h1>
              <p className="mono-data mt-0.5">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="card w-full max-w-sm animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-cloud">New Group</h2>
                  <button onClick={() => { setShowCreate(false); setMemberInputs(['']); }} className="text-ash hover:text-cloud transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {memberInputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="mono-data w-5 text-center">{index + 1}</span>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => updateMemberInput(index, e.target.value)}
                        placeholder={`Member ${index + 1}`}
                        className="input-shell flex-1"
                        autoFocus={index === memberInputs.length - 1}
                      />
                      {memberInputs.length > 1 && (
                        <button onClick={() => removeMemberInput(index)} className="text-ash hover:text-red-400 transition-colors p-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button onClick={addMemberInput} className="w-full border border-dashed border-shell-4 rounded-md py-2 text-xs text-ash hover:text-action hover:border-action/30 transition-all mb-4">
                  + Add Member
                </button>

                <div className="flex gap-2">
                  <button onClick={handleCreateGroup} disabled={!memberInputs.some((l) => l.trim())} className="btn-primary flex-1 disabled:opacity-40">Create</button>
                  <button onClick={() => { setShowCreate(false); setMemberInputs(['']); }} className="btn-ghost">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Groups Grid */}
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.map((group) => (
                <button
                  key={group.contractAddress}
                  onClick={() => navigate(`/group/${group.contractAddress}`)}
                  className="card text-left hover:border-shell-5 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-md bg-action flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{group.members.length}</span>
                    </div>
                    <svg className="w-4 h-4 text-shell-5 group-hover:text-ash transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-cloud mb-1">Expense Group</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ash">{group.members.length} members</span>
                    <span className="mono-data text-[10px]">{group.contractAddress.slice(0, 8)}...</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-sm text-ash mb-3">No groups yet</p>
              <button onClick={() => setShowCreate(true)} className="text-action text-sm font-medium hover:text-action-light transition-colors">
                Create your first group
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
