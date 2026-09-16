import type { Approval, UserRole } from "@/types";

interface Props {
  requiredRoles: UserRole[];
  approvals: Approval[];
  currentUserRole?: UserRole;
  onApprove: (role: UserRole) => void;
}

export default function ApprovalGate({
  requiredRoles,
  approvals,
  currentUserRole,
  onApprove,
}: Props) {
  return (
    <div className="space-y-2 rounded border border-gray-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-gray-900">승인 (책임과 권한에 따른 필수 승인자)</h2>
      {requiredRoles.map((role) => {
        const a = approvals.find((x) => x.role === role);
        return (
          <div key={role} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{role}</span>
            {a ? (
              <span className="text-green-700">
                승인됨 — {a.name} ({a.date})
              </span>
            ) : currentUserRole === role ? (
              <button
                type="button"
                onClick={() => onApprove(role)}
                className="rounded bg-gray-900 px-2 py-1 text-xs text-white"
              >
                승인하기
              </button>
            ) : (
              <span className="text-gray-400">미승인</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
