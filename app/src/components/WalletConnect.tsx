import { useState } from 'react';

interface WalletConnectProps {
  onConnect: (secret: string) => void;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  onDisconnect: () => void;
  error: string | null;
}

export default function WalletConnect({
  onConnect,
  connected,
  connecting,
  address,
  onDisconnect,
  error,
}: WalletConnectProps) {
  const [seed, setSeed] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleConnect = () => {
    if (seed.trim()) {
      onConnect(seed.trim());
      setShowInput(false);
    }
  };

  if (connected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-mono text-green-700">
            {address.slice(0, 8)}...{address.slice(-6)}
          </span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (showInput) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="password"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Enter wallet seed or mnemonic"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-midnight-500 focus:border-midnight-500"
          onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
        />
        <button
          onClick={handleConnect}
          disabled={connecting || !seed.trim()}
          className="bg-midnight-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-midnight-700 disabled:opacity-50"
        >
          {connecting ? 'Connecting...' : 'Connect'}
        </button>
        <button
          onClick={() => setShowInput(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setShowInput(true)}
        className="bg-midnight-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-midnight-700"
      >
        Connect Wallet
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
