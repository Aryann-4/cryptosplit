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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-shell-2 border border-shell-4">
          <span className="w-1.5 h-1.5 bg-mint rounded-full" />
          <span className="text-xs text-cloud font-medium">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
          </span>
        </div>
        <button onClick={onDisconnect} className="text-[10px] text-ash hover:text-red-400 transition-colors px-2 py-1.5">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={network}
        onChange={(e) => setNetwork(e.target.value)}
        className="input-shell !w-auto !py-1.5 !px-2.5 text-xs"
      >
        <option value="preprod">Preprod</option>
        <option value="preview">Preview</option>
        <option value="local">Local</option>
      </select>
      <button onClick={() => onConnect(network)} className="btn-primary !py-1.5 !px-3 text-xs">
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <span className="text-[10px] text-red-400 max-w-[160px] truncate" title={error}>{error}</span>}
    </div>
  );
}
