import type { Member } from '../types.ts';
import { getMemberLabel } from '../store.ts';

interface MemberListProps {
  members: Member[];
  onAddMember?: () => void;
}

export default function MemberList({ members, onAddMember }: MemberListProps) {
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Members ({members.length})</span>
        </h3>
      </div>

      <div className="space-y-1.5">
        {members.map((member, index) => {
          const label = getMemberLabel(member.memberId);
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-indigo-400">{label.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{label}</p>
                  <p className="text-[10px] text-surface-600 font-mono">{member.memberId.slice(0, 8)}...</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                member.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-500/10 text-surface-500'
              }`}>
                {member.isActive ? 'Active' : 'Removed'}
              </span>
            </div>
          );
        })}
      </div>

      {onAddMember && (
        <button
          onClick={onAddMember}
          className="w-full mt-3 border border-dashed border-white/[0.08] rounded-xl py-2.5 text-sm text-surface-500 hover:border-indigo-500/30 hover:text-indigo-400 transition-all flex items-center justify-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Member</span>
        </button>
      )}
    </div>
  );
}
