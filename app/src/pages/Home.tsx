import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.tsx';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CryptoSplit</h1>
          <p className="text-gray-600 mt-1">Split expenses with friends, settle on-chain</p>
        </div>
        <WalletConnect
          onConnect={wallet.connect}
          connected={wallet.connected}
          connecting={wallet.connecting}
          address={wallet.address}
          onDisconnect={wallet.disconnect}
          error={wallet.error}
        />
      </div>

      {!wallet.connected ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <div className="w-16 h-16 bg-midnight-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔗</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Connect your Midnight wallet to create or join expense groups and settle debts on-chain.
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreate(true)}
              className="bg-midnight-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-midnight-700"
            >
              Create Group
            </button>
          </div>

          {showCreate && (
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
              <p className="text-sm text-gray-600">
                Add member names to create your expense group.
              </p>

              <div className="space-y-2">
                {memberInputs.map((input, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => updateMemberInput(index, e.target.value)}
                      placeholder={`Member ${index + 1} name`}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500"
                    />
                    {memberInputs.length > 1 && (
                      <button
                        onClick={() => removeMemberInput(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addMemberInput}
                className="text-sm text-midnight-600 hover:text-midnight-800 font-medium"
              >
                + Add Another Member
              </button>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleCreateGroup}
                  className="bg-midnight-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-midnight-700"
                >
                  Create Group
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setMemberInputs(['']);
                  }}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <button
                  key={group.contractAddress}
                  onClick={() => navigate(`/group/${group.contractAddress}`)}
                  className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-midnight-100 rounded-lg flex items-center justify-center">
                      <span className="text-midnight-600 font-bold">
                        {group.members.length}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Expense Group</p>
                      <p className="text-xs text-gray-500">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {group.members.length} members
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {group.contractAddress.slice(0, 16)}...
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No groups yet. Create one to get started!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
