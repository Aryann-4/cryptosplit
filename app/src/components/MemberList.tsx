import type { Member } from '../types.ts';
import { getMemberLabel } from '../store.ts';

interface MemberListProps {
  members: Member[];
  onAddMember?: () => void;
}

export default function MemberList({ members, onAddMember }: MemberListProps) {
  return (
    <div className="glass p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="label">Members ({members.length})</h3>
      </div>

      <div className="space-y-2">
        {members.map((member, index) => {
          const label = getMemberLabel(member.memberId);
          return (
            <div
              key={index}
              className="glass-subtle p-3 flex items-center justify-between hover:border-white/[0.1] hover:shadow-card-hover transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold/20 to-gold-dim/20 border border-gold/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-gold">{label.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{label}</p>
                  <p className="mono-data text-[10px]">{member.memberId.slice(0, 8)}...</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                member.isActive ? 'bg-mint/10 text-mint' : 'bg-white/[0.04] text-ash'
              }`}>
                {member.isActive ? 'Active' : 'Removed'}
              </span>
            </div>
          );
        })}
      </div>

      {onAddMember && (
        <button onClick={onAddMember} className="btn-secondary w-full mt-4">
          + Add Member
        </button>
      )}
    </div>
  );
}
