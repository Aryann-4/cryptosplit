import type { Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface MemberListProps {
  members: Member[];
  onAddMember?: () => void;
  addingMember?: boolean;
}

const AVATAR_GRADIENTS = [
  'from-[#4c6ef5] to-[#7c3aed]',
  'from-[#7c3aed] to-[#a855f7]',
  'from-[#06b6d4] to-[#3b82f6]',
  'from-[#10b981] to-[#06b6d4]',
  'from-[#f59e0b] to-[#f97316]',
  'from-[#ef4444] to-[#ec4899]',
  'from-[#8b5cf6] to-[#d946ef]',
  'from-[#14b8a6] to-[#22d3ee]',
];

export default function MemberList({ members, onAddMember, addingMember }: MemberListProps) {
  const activeCount = members.filter(m => m.isActive).length;
  const inactiveCount = members.filter(m => !m.isActive).length;

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold gradient-text flex items-center space-x-2">
          <svg className="w-5 h-5 text-[#4c6ef5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Members</span>
        </h3>
        {onAddMember && (
          <button
            onClick={onAddMember}
            disabled={addingMember}
            className="text-sm text-[#4c6ef5] hover:text-[#748ffc] font-medium disabled:opacity-50 transition-colors flex items-center space-x-1"
          >
            {addingMember ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3 mb-4 text-sm">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
          <span className="text-surface-400">{activeCount} active</span>
        </span>
        {inactiveCount > 0 && (
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-surface-600 rounded-full"></span>
            <span className="text-surface-500">{inactiveCount} removed</span>
          </span>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member, index) => (
          <div
            key={bytesToHex(member.memberId)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              member.isActive
                ? 'bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06]'
                : 'bg-white/[0.01] opacity-50 border border-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                {member.label.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-surface-200">{member.label}</p>
                <p className="text-xs text-surface-600 font-mono">{bytesToHex(member.memberId).slice(0, 16)}...</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              member.isActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-white/[0.05] text-surface-500 border border-white/[0.06]'
            }`}>
              {member.isActive ? 'Active' : 'Removed'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
