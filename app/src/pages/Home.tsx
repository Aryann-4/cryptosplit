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
          <div className="relative overflow-hidden bg-gradient-to-br from-midnight-600 via-purple-700 to-indigo-800 rounded-2xl shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animation-delay-2000 animate-blob"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-overlay filter blur-3xl animation-delay-4000 animate-blob"></div>
            </div>
            <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm font-medium">Live on Midnight Preprod</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Split Expenses,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">Keep Privacy</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed">
                CryptoSplit uses zero-knowledge proofs on Midnight Network to let you split bills with friends. Your wallet address, names, and spending habits never touch the blockchain.
              </p>
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
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">0</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Wallet Addresses On-Chain</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">ZK</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Proofs Generated Locally</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-white/50 uppercase tracking-wider">Private by Default</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero-Knowledge Identity</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your on-chain identity is a commitment hash: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">hash(secret)</code>. The blockchain never sees your wallet address or real name.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Domain-Separated Debt Keys</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Debt relationships use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">hash(domain, debtor, creditor)</code>. Observers see a random-looking hash, not who owes whom.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ZK-Settled Payments</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Settlement proves you authorized payment without revealing who you are. Only commitment hashes and token amounts appear on-chain.
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
              <h1 className="text-2xl font-bold text-gray-900">Your Groups</h1>
              <p className="text-sm text-gray-500 mt-1">
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
                className="bg-gradient-to-r from-midnight-600 to-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-midnight-700 hover:to-purple-700 shadow-sm transition-all flex items-center space-x-2"
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
                  <button
                    onClick={() => { setShowCreate(false); setMemberInputs(['']); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Add member names to create your expense group. Each member gets a cryptographic identity.
                </p>

                <div className="space-y-2">
                  {memberInputs.map((input, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-midnight-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-midnight-600 text-sm font-medium">{index + 1}</span>
                      </div>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => updateMemberInput(index, e.target.value)}
                        placeholder={`Member ${index + 1} name`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500 transition-colors"
                        autoFocus={index === memberInputs.length - 1}
                      />
                      {memberInputs.length > 1 && (
                        <button
                          onClick={() => removeMemberInput(index)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
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
                  className="w-full border-2 border-dashed border-gray-200 rounded-lg py-2 text-sm text-gray-500 hover:border-midnight-300 hover:text-midnight-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Another Member</span>
                </button>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleCreateGroup}
                    disabled={!memberInputs.some((l) => l.trim())}
                    className="flex-1 bg-gradient-to-r from-midnight-600 to-purple-600 text-white py-2.5 rounded-lg font-medium hover:from-midnight-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-sm"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => { setShowCreate(false); setMemberInputs(['']); }}
                    className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
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
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-midnight-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:from-midnight-600 group-hover:to-purple-700 transition-all shadow-sm">
                      <span className="text-white font-bold text-lg">{group.members.length}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Expense Group</p>
                      <p className="text-xs text-gray-500">
                        Created {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {group.contractAddress.slice(0, 8)}...
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No groups yet</h3>
              <p className="text-gray-500 mb-4">Create your first expense group to get started!</p>
              <button
                onClick={() => setShowCreate(true)}
                className="text-midnight-600 hover:text-midnight-800 font-medium text-sm"
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
