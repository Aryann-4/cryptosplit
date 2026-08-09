import type { Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface MemberListProps {
  members: Member[];
  onAddMember?: () => void;
  addingMember?: boolean;
}

export default function MemberList({ members, onAddMember, addingMember }: MemberListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Members</h3>
        {onAddMember && (
          <button
            onClick={onAddMember}
            disabled={addingMember}
            className="text-sm text-midnight-600 hover:text-midnight-800 font-medium disabled:opacity-50"
          >
            {addingMember ? 'Adding...' : '+ Add Member'}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={bytesToHex(member.memberId)}
            className={`flex items-center justify-between p-3 rounded-lg ${
              member.isActive ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  member.isActive ? 'bg-midnight-600' : 'bg-gray-400'
                }`}
              >
                {member.label.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.label}</p>
                <p className="text-xs text-gray-500 font-mono">
                  {bytesToHex(member.memberId).slice(0, 12)}...
                </p>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                member.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {member.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
