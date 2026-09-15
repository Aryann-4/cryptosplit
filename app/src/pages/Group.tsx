import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.tsx';
import ExpenseForm from '../components/ExpenseForm.tsx';
import ExpenseList from '../components/ExpenseList.tsx';
import BalanceView from '../components/BalanceView.tsx';
import SettlementPanel from '../components/SettlementPanel.tsx';
import MemberList from '../components/MemberList.tsx';
import CircuitCall from '../components/CircuitCall.tsx';
import { useWallet } from '../hooks/useWallet.ts';
import { callCircuit } from '../utils/contract.ts';
import { getGroup, getExpenses, getNetDebts, addExpense } from '../store.ts';
import { generateSecret, getMemberId, bytesToHex } from '../crypto.ts';
import type { Group, Expense, Member } from '../types.ts';

export default function Group() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();

  const [group, setGroup] = useState<Group | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [settling, setSettling] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [circuitStatus, setCircuitStatus] = useState<{
    message: string;
    type: 'info' | 'success' | 'error';
  } | null>(null);
  const [circuitResult, setCircuitResult] = useState<{
    status: 'idle' | 'proving' | 'submitting' | 'success' | 'error';
    txHash: string | null;
    error: string | null;
  }>({ status: 'idle', txHash: null, error: null });

  useEffect(() => {
    if (address) {
      const found = getGroup(address);
      if (found) setGroup(found);
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

  const handleSettle = async (creditorId: Uint8Array, amount: bigint) => {
    setSettling(true);
    setCircuitStatus({ message: 'Generating ZK proof...', type: 'info' });
    try {
      const result = await callCircuit('settle', {
        debtorSecretHex: bytesToHex(generateSecret()),
        creditorIdHex: bytesToHex(creditorId),
        amount: Number(amount),
        creditorAddressHex: bytesToHex(creditorId),
      });
      if (result.status === 'success') {
        setCircuitStatus({ message: 'Settlement proved!', type: 'success' });
        setRefresh((r) => r + 1);
      } else {
        setCircuitStatus({ message: result.error || 'Failed', type: 'error' });
      }
    } catch (err) {
      setCircuitStatus({ message: err instanceof Error ? err.message : 'Error', type: 'error' });
    } finally {
      setSettling(false);
      setTimeout(() => setCircuitStatus(null), 4000);
    }
  };

  const handleAddMember = async () => {
    if (!group) return;
    const secret = generateSecret();
    const memberId = getMemberId(secret);
    setCircuitStatus({ message: 'Generating ZK proof...', type: 'info' });
    try {
      await callCircuit('add-member', { memberSecretHex: bytesToHex(secret) });
      const newMember: Member = { memberId, label: `Member ${group.members.length + 1}`, isActive: true };
      setGroup({ ...group, members: [...group.members, newMember] });
      setCircuitStatus({ message: 'Member added!', type: 'success' });
    } catch (err) {
      setCircuitStatus({ message: err instanceof Error ? err.message : 'Error', type: 'error' });
    } finally {
      setTimeout(() => setCircuitStatus(null), 4000);
    }
  };

  const handleCircuitCall = async (circuit: string, args: Record<string, unknown>) => {
    setCircuitResult({ status: 'proving', txHash: null, error: null });
    try {
      const result = await callCircuit(circuit, args);
      setCircuitResult({ status: 'success', txHash: result.txHash ?? null, error: null });
    } catch (err) {
      setCircuitResult({ status: 'error', txHash: null, error: err instanceof Error ? err.message : 'Unknown' });
    }
  };

  if (!group) {
    return (
      <div className="glass text-center py-20 animate-fade-in">
        <p className="text-sm text-ash mb-4">Group not found</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  const expenses = getExpenses(group.contractAddress);
  const netDebts = getNetDebts(group.contractAddress);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0n);
  const myDebts = wallet.coinPublicKeyBytes
    ? netDebts.filter((d) => bytesToHex(d.debtorId) === bytesToHex(wallet.coinPublicKeyBytes!))
    : [];
  const totalOwed = myDebts.reduce((sum, d) => sum + d.amount, 0n);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <button onClick={() => navigate('/')} className="text-sm text-gold hover:text-gold-light mb-2 flex items-center gap-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-bold text-white">Expense Group</h1>
          <p className="mono-data text-[10px] mt-1">{group.contractAddress}</p>
        </div>
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

      <div className="glass p-5 animate-slide-up delay-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Members', value: group.members.length },
            { label: 'Expenses', value: expenses.length },
            { label: 'Total', value: totalExpense > 0n ? `$${(Number(totalExpense) / 100).toFixed(0)}` : '$0' },
            ...(wallet.connected ? [{ label: 'You Owe', value: totalOwed > 0n ? `$${(Number(totalOwed) / 100).toFixed(2)}` : '$0' }] : []),
          ].map((stat) => (
            <div key={stat.label}>
              <div className="label !text-[9px] mb-1.5">{stat.label}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {circuitStatus && (
        <div className={`glass-subtle px-4 py-3 text-sm font-medium border animate-scale-in ${
          circuitStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          circuitStatus.type === 'success' ? 'bg-mint/10 text-mint border-mint/20' :
          'bg-gold/10 text-gold border-gold/20'
        }`}>
          <div className="flex items-center gap-2.5">
            {circuitStatus.type === 'info' && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {circuitStatus.type === 'success' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
            {circuitStatus.type === 'error' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
            <span>{circuitStatus.message}</span>
          </div>
        </div>
      )}

      <div className="flex gap-1 p-1 glass-subtle animate-slide-up delay-2">
        {(['expenses', 'balances', 'members'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-gold text-[#0a0a0f] shadow-[0_0_16px_rgba(251,191,36,0.3)]'
                : 'text-ash hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'expenses' && ` (${expenses.length})`}
            {tab === 'balances' && netDebts.length > 0 && ` (${netDebts.length})`}
            {tab === 'members' && ` (${group.members.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {activeTab === 'expenses' && (
            <div className="animate-fade-in">
              {wallet.connected && <ExpenseForm members={group.members} onSubmit={handleAddExpense} />}
              <ExpenseList expenses={expenses} members={group.members} />
            </div>
          )}
          {activeTab === 'balances' && (
            <div className="animate-fade-in">
              <BalanceView netDebts={netDebts} members={group.members} currentMemberId={wallet.coinPublicKeyBytes ?? undefined} />
            </div>
          )}
          {activeTab === 'members' && (
            <div className="animate-fade-in">
              <MemberList members={group.members} onAddMember={wallet.connected ? handleAddMember : undefined} />
            </div>
          )}
        </div>

        <div className="space-y-5">
          {wallet.connected && activeTab !== 'balances' && (
            <BalanceView netDebts={netDebts} members={group.members} currentMemberId={wallet.coinPublicKeyBytes ?? undefined} />
          )}
          {wallet.connected && (
            <>
              <SettlementPanel
                netDebts={netDebts}
                members={group.members}
                currentMemberId={wallet.coinPublicKeyBytes ?? undefined}
                onSettle={handleSettle}
                settling={settling}
              />
              <CircuitCall
                connected={wallet.connected}
                onCallCircuit={handleCircuitCall}
                circuitResult={circuitResult}
                onReset={() => setCircuitResult({ status: 'idle', txHash: null, error: null })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
