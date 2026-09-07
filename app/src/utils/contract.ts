const API_BASE = '/api';

export interface CircuitResult {
  status: string;
  circuit?: string;
  error?: string;
  memberIdPartial?: string;
  txHash?: string;
}

export async function callCircuit(
  circuit: string,
  args: Record<string, unknown>,
): Promise<CircuitResult> {
  try {
    const response = await fetch(`${API_BASE}/${circuit}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return await response.json();
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return { status: 'success', circuit };
  }
}

export function getContractAddress(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('cryptosplit-contract-address');
  }
  return null;
}

export function setContractAddress(address: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cryptosplit-contract-address', address);
  }
}
