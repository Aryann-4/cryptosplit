import type { Member } from '../types.ts';
import { getMemberLabel } from '../store.ts';

interface MemberListProps {
  members: Member[];
  onAddMember?: () => void;
}

export default function MemberList({ members, onAddMember }: MemberListProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="label">Members ({members.length})</h3>
      </div>

      <div className="space-y-1">
        {members.map((member, index) => {
          const label = getMemberLabel(member.memberId);
          return (
            <div key={index} className="flex items-center justify-between p-2.5 rounded-md bg-shell-2 border border-shell-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-action/10 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-action">{label.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs text-cloud font-medium">{label}</p>
                  <p className="mono-data text-[10px]">{member.memberId.slice(0, 8)}...</p>
                </div>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                member.isActive ? 'bg-mint/10 text-mint' : 'bg-shell-4 text-ash'
              }`}>
                {member.isActive ? 'Active' : 'Removed'}
              </span>
            </div>
          );
        })}
      </div>

      {onAddMember && (
        <button onClick={onAddMember} className="w-full mt-3 btn-ghost text-xs">
          + Add Member
        </button>
      )}
    </div>
  );
}
