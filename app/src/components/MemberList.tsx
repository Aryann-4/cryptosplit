import type { Member } from '../types.ts';
import { bytesToHex } from '../crypto.ts';

interface MemberListProps {
  members: Member[];
  onAddMember?: () => void;
  addingMember?: boolean;
}

const AVATAR_COLORS = [
  'from-purple-500 to-purple-600',
  'from-indigo-500 to-indigo-600',
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
  'from-pink-500 to-pink-600',
];

export default function MemberList({ members, onAddMember, addingMember }: MemberListProps) {
  const activeCount = members.filter(m => m.isActive).length;
  const inactiveCount = members.filter(m => !m.isActive).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <svg className="w-5 h-5 text-midnight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Members</span>
        </h3>
        {onAddMember && (
          <button
            onClick={onAddMember}
            disabled={addingMember}
            className="text-sm text-midnight-600 hover:text-midnight-800 font-medium disabled:opacity-50 transition-colors flex items-center space-x-1"
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

      {/* Summary */}
      <div className="flex items-center space-x-3 mb-4 text-sm">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-gray-600">{activeCount} active</span>
        </span>
        {inactiveCount > 0 && (
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="text-gray-500">{inactiveCount} removed</span>
          </span>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member, index) => (
          <div
            key={bytesToHex(member.memberId)}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              member.isActive
                ? 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                : 'bg-gray-50/50 opacity-60 border border-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${
                AVATAR_COLORS[index % AVATAR_COLORS.length]
              } shadow-sm`}>
                {member.label.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.label}</p>
                <p className="text-xs text-gray-400 font-mono">
                  {bytesToHex(member.memberId).slice(0, 16)}...
                </p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                member.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {member.isActive ? 'Active' : 'Removed'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
