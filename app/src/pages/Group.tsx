import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.tsx';
import ExpenseForm from '../components/ExpenseForm.tsx';
import ExpenseList from '../components/ExpenseList.tsx';
import BalanceView from '../components/BalanceView.tsx';
import SettlementPanel from '../components/SettlementPanel.tsx';
import MemberList from '../components/MemberList.tsx';
import { useWallet } from '../hooks/useWallet.ts';
import { getGroup, getExpenses, getNetDebts, addExpense } from '../store.ts';
import { generateSecret, getMemberId, bytesToHex } from '../crypto.ts';
import type { Group, Expense, Member } from '../types.ts';

export default function Group() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();

  const [group, setGroup] = useState<Group | null>(null);
  const [, setRefresh] = useState(0);

  useEffect(() => {
    if (address) {
      const found = getGroup(address);
      if (found) {
        setGroup(found);
      }
    }
  }, [address]);

  const handleAddExpense = (expenseData: {
    amount: bigint;
    participantIds: Uint8Array[];
    splitType: 'equal' | 'custom';
    description: string;
  }) => {
    if (!group || !wallet.coinPublicKeyBytes) return;

    const expense: Expense = {
      id: `expense-${Date.now()}`,
      groupId: group.contractAddress,
      payer: wallet.coinPublicKeyBytes,
      amount: expenseData.amount,
      participants: expenseData.participantIds,
      splitType: expenseData.splitType,
      description: expenseData.description,
      timestamp: Date.now(),
    };

    addExpense(group.contractAddress, expense);
    setRefresh((r) => r + 1);
  };

  const handleSettle = (creditorId: Uint8Array, amount: bigint) => {
    // In a real app, this would call the contract's settle() function
    alert(`Would settle ${Number(amount) / 100} with ${bytesToHex(creditorId).slice(0, 8)}...`);
  };

  const handleAddMember = () => {
    if (!group) return;
    const secret = generateSecret();
    const memberId = getMemberId(secret);
    const newMember: Member = {
      memberId,
      label: `Member ${group.members.length + 1}`,
      isActive: true,
    };
    setGroup({
      ...group,
      members: [...group.members, newMember],
    });
  };

  if (!group) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Group not found</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-midnight-600 hover:text-midnight-800 underline"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const expenses = getExpenses(group.contractAddress);
  const netDebts = getNetDebts(group.contractAddress);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-midnight-600 hover:text-midnight-800 mb-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Expense Group</h1>
          <p className="text-sm text-gray-500 font-mono">{group.contractAddress}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {wallet.connected && (
            <ExpenseForm
              members={group.members}
              onSubmit={handleAddExpense}
            />
          )}
          <ExpenseList expenses={expenses} members={group.members} />
        </div>

        <div className="space-y-6">
          <MemberList
            members={group.members}
            onAddMember={wallet.connected ? handleAddMember : undefined}
          />
          <BalanceView
            netDebts={netDebts}
            members={group.members}
            currentMemberId={wallet.coinPublicKeyBytes ?? undefined}
          />
          {wallet.connected && (
            <SettlementPanel
              netDebts={netDebts}
              members={group.members}
              currentMemberId={wallet.coinPublicKeyBytes ?? undefined}
              onSettle={handleSettle}
              settling={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
