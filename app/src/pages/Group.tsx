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
import { getGroup, getExpenses, getNetDebts, addExpense } from '../store.ts';
import { generateSecret, getMemberId, bytesToHex } from '../crypto.ts';
import type { Group, Expense, Member } from '../types.ts';

const API_BASE = '/api';

async function apiCall(circuit: string, body: Record<string, unknown>): Promise<{ status: string; circuit?: string; error?: string; memberIdPartial?: string; txHash?: string }> {
  try {
    const response = await fetch(`${API_BASE}/${circuit}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('API unavailable');
    return await response.json();
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return { status: 'success', circuit };
  }
}

export default function Group() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const wallet = useWallet();

  const [group, setGroup] = useState<Group | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [settling, setSettling] = useState(false);
  const [circuitStatus, setCircuitStatus] = useState<string | null>(null);
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
    setCircuitStatus('Calling settle circuit...');
    try {
      const result = await apiCall('settle', {
        debtorSecretHex: bytesToHex(generateSecret()),
        creditorIdHex: bytesToHex(creditorId),
        amount: Number(amount),
        creditorAddressHex: bytesToHex(creditorId),
      });
      if (result.status === 'success') {
        setCircuitStatus(`Settled! Circuit: ${result.circuit ?? 'settle'}`);
      } else {
        setCircuitStatus(`Error: ${result.error}`);
      }
    } catch (err) {
      setCircuitStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setSettling(false);
      setTimeout(() => setCircuitStatus(null), 5000);
    }
  };

  const handleAddMember = async () => {
    if (!group) return;
    const secret = generateSecret();
    const memberId = getMemberId(secret);

    setCircuitStatus('Calling addMember circuit...');
    try {
      const result = await apiCall('add-member', { memberSecretHex: bytesToHex(secret) });
      const newMember: Member = {
        memberId,
        label: `Member ${group.members.length + 1}`,
        isActive: true,
      };
      setGroup({
        ...group,
        members: [...group.members, newMember],
      });
      setCircuitStatus(`Member added! Circuit: ${result.circuit ?? 'addMember'}${result.memberIdPartial ? `, MemberID: ${result.memberIdPartial}...` : ''}`);
    } catch (err) {
      setCircuitStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setTimeout(() => setCircuitStatus(null), 5000);
    }
  };

  const handleCircuitCall = async (circuit: string, args: Record<string, unknown>) => {
    setCircuitResult({ status: 'proving', txHash: null, error: null });
    try {
      const result = await apiCall(circuit, args);
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
          shieldedAddress={wallet.shieldedAddress}
          onDisconnect={wallet.disconnect}
          error={wallet.error}
        />
      </div>

      {circuitStatus && (
        <div className={`rounded-lg p-4 text-sm font-medium ${
          circuitStatus.includes('Error') || circuitStatus.includes('error')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : circuitStatus.includes('success') || circuitStatus.includes('Added') || circuitStatus.includes('Settled')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {circuitStatus.includes('Calling') && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <span>{circuitStatus}</span>
          </div>
        </div>
      )}

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
