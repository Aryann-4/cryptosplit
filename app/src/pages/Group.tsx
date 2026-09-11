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

  const handleSettle = async (creditorId: Uint8Array, amount: bigint) => {
    setSettling(true);
    setCircuitStatus({ message: 'Generating ZK proof for settlement...', type: 'info' });
    try {
      const result = await callCircuit('settle', {
        debtorSecretHex: bytesToHex(generateSecret()),
        creditorIdHex: bytesToHex(creditorId),
        amount: Number(amount),
        creditorAddressHex: bytesToHex(creditorId),
      });
      if (result.status === 'success') {
        setCircuitStatus({ message: 'Settlement proved and submitted on-chain!', type: 'success' });
        setRefresh((r) => r + 1);
      } else {
        setCircuitStatus({ message: result.error || 'Settlement failed', type: 'error' });
      }
    } catch (err) {
      setCircuitStatus({ message: err instanceof Error ? err.message : 'Unknown error', type: 'error' });
    } finally {
      setSettling(false);
      setTimeout(() => setCircuitStatus(null), 5000);
    }
  };

  const handleAddMember = async () => {
    if (!group) return;
    const secret = generateSecret();
    const memberId = getMemberId(secret);

    setCircuitStatus({ message: 'Generating ZK proof for membership...', type: 'info' });
    try {
      const result = await callCircuit('add-member', { memberSecretHex: bytesToHex(secret) });
      const newMember: Member = {
        memberId,
        label: `Member ${group.members.length + 1}`,
        isActive: true,
      };
      setGroup({
        ...group,
        members: [...group.members, newMember],
      });
      const memberIdPartial = result.memberIdPartial ? ` (${result.memberIdPartial}...)` : '';
      setCircuitStatus({ message: `Member added! Commitment: hash(secret)${memberIdPartial}`, type: 'success' });
    } catch (err) {
      setCircuitStatus({ message: err instanceof Error ? err.message : 'Unknown error', type: 'error' });
    } finally {
      setTimeout(() => setCircuitStatus(null), 5000);
    }
  };

  const handleCircuitCall = async (circuit: string, args: Record<string, unknown>) => {
    setCircuitResult({ status: 'proving', txHash: null, error: null });
    try {
      const result = await callCircuit(circuit, args);
      setCircuitResult({
        status: 'success',
        txHash: result.txHash ?? null,
        error: null,
      });
    } catch (err) {
      setCircuitResult({
        status: 'error',
        txHash: null,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  if (!group) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Group not found</h2>
        <p className="text-gray-500 mb-4">This group may have been removed or the link is invalid.</p>
        <button
          onClick={() => navigate('/')}
          className="text-midnight-600 hover:text-midnight-800 font-medium"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const expenses = getExpenses(group.contractAddress);
  const netDebts = getNetDebts(group.contractAddress);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-sm text-midnight-600 hover:text-midnight-800 mb-2 flex items-center space-x-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Expense Group</h1>
            <p className="text-sm text-gray-400 font-mono mt-1">{group.contractAddress}</p>
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

        {/* Stats Bar */}
        <div className="mt-4 grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{group.members.length}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{expenses.length}</div>
            <div className="text-xs text-gray-500">Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {totalExpense > 0n ? `$${(Number(totalExpense) / 100).toFixed(0)}` : '$0'}
            </div>
            <div className="text-xs text-gray-500">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Circuit Status Toast */}
      {circuitStatus && (
        <div className={`rounded-xl p-4 text-sm font-medium shadow-sm border ${
          circuitStatus.type === 'error'
            ? 'bg-red-50 text-red-700 border-red-200'
            : circuitStatus.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            {circuitStatus.type === 'info' && (
              <svg className="animate-spin h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {circuitStatus.type === 'success' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {circuitStatus.type === 'error' && (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{circuitStatus.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {wallet.connected && (
            <ExpenseForm
              members={group.members}
              onSubmit={handleAddExpense}
            />
          )}
          <ExpenseList expenses={expenses} members={group.members} />
        </div>

        {/* Right Column */}
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
              settling={settling}
            />
          )}
          {wallet.connected && (
            <CircuitCall
              connected={wallet.connected}
              onCallCircuit={handleCircuitCall}
              circuitResult={circuitResult}
              onReset={() => setCircuitResult({ status: 'idle', txHash: null, error: null })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
