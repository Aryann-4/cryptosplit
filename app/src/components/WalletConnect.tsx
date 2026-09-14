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
  if (connected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-white font-medium truncate max-w-[120px]">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
          </span>
        </div>
        <button onClick={onDisconnect} className="text-[10px] text-surface-500 hover:text-red-400 transition-colors px-2 py-2">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <select
        onChange={(e) => onConnect(e.target.value)}
        className="bg-white/[0.04] border border-white/[0.06] text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
      >
        <option value="preprod">Preprod</option>
        <option value="preview">Preview</option>
        <option value="local">Local</option>
      </select>
    </div>
  );
}
