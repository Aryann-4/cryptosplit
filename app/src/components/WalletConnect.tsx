import { useState } from 'react';

interface WalletConnectProps {
  onConnect: (network: string) => void;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  shieldedAddress: string | null;
  onDisconnect: () => void;
  error: string | null;
}

export default function WalletConnect({ onConnect, connected, connecting, address, shieldedAddress, onDisconnect, error }: WalletConnectProps) {
  const [network, setNetwork] = useState('preprod');

  if (connected) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <span className="w-2 h-2 bg-mint rounded-full animate-pulse" />
          <span className="text-sm text-white font-medium">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
          </span>
        </div>
        <button onClick={onDisconnect} className="text-xs text-ash hover:text-red-400 transition-colors px-3 py-2">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <select
        value={network}
        onChange={(e) => setNetwork(e.target.value)}
        className="input-glass !w-auto !py-2.5 !px-3 text-sm"
      >
        <option value="preprod">Preprod</option>
        <option value="preview">Preview</option>
        <option value="local">Local</option>
      </select>
      <button
        onClick={() => onConnect(network)}
        className="btn-primary text-sm"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <span className="text-xs text-red-400 max-w-[180px] truncate" title={error}>{error}</span>}
    </div>
  );
}
