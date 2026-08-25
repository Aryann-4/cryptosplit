import { useState, useEffect } from 'react';

interface WalletConnectProps {
  onConnect: () => void;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  shieldedAddress: string | null;
  onDisconnect: () => void;
  error: string | null;
}

function getStoredNetwork(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('midnight-network') || 'preprod';
  }
  return 'preprod';
}

export default function WalletConnect({
  onConnect,
  connected,
  connecting,
  address,
  shieldedAddress,
  onDisconnect,
  error,
}: WalletConnectProps) {
  const [walletDetected, setWalletDetected] = useState<boolean | null>(null);
  const [network, setNetwork] = useState<string>(getStoredNetwork);

  useEffect(() => {
    const checkWallet = () => {
      if (typeof window !== 'undefined' && window.midnight) {
        const wallets = Object.values(window.midnight).filter(
          (w) => !!w && typeof w === 'object' && 'connect' in w,
        );
        setWalletDetected(wallets.length > 0);
      } else {
        setWalletDetected(false);
      }
    };

    checkWallet();
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNetworkChange = (newNetwork: string) => {
    setNetwork(newNetwork);
    localStorage.setItem('midnight-network', newNetwork);
    if (connected) {
      onDisconnect();
    }
  };

  if (connected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono text-green-700">
              {address.slice(0, 12)}...{address.slice(-8)}
            </span>
          </div>
          {shieldedAddress && (
            <div className="flex items-center space-x-2 mt-1 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs font-mono text-purple-700" title={shieldedAddress}>
                Shielded: {shieldedAddress.slice(0, 12)}...{shieldedAddress.slice(-8)}
              </span>
            </div>
          )}
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

  return (
    <div className="flex items-center space-x-2">
      <select
        value={network}
        onChange={(e) => handleNetworkChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-midnight-500"
      >
        <option value="preprod">Preprod</option>
        <option value="preview">Preview</option>
        <option value="undeployed">Local</option>
      </select>

      <button
        onClick={onConnect}
        disabled={connecting || walletDetected === false}
        className="bg-midnight-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-midnight-700 disabled:opacity-50 flex items-center space-x-2"
      >
        {connecting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Connect Lace Wallet</span>
          </>
        )}
      </button>

      {walletDetected === false && (
        <div className="mt-2">
          <p className="text-amber-600 text-sm mb-1">Lace wallet not detected</p>
          <a
            href="https://docs.midnight.network/wallet/install-lace"
            target="_blank"
            rel="noopener noreferrer"
            className="text-midnight-600 text-xs hover:underline"
          >
            Install Midnight Lace wallet
          </a>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
