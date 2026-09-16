import ProtectedShell from "@/components/ProtectedShell";
import MasterCrud from "@/components/MasterCrud";
import { USER_ROLES } from "@/types";

export default function UsersPage() {
  return (
    <ProtectedShell>
      <div className="space-y-4">
        <p className="text-xs text-gray-400">
          계정(로그인)은 Firebase 콘솔에서 생성되며, 최초 로그인 시 아래 목록에 자동으로
          추가됩니다. 여기서는 부서/역할만 지정하세요.
        </p>
        <MasterCrud
          collectionName="users"
          title="사용자/권한"
          fields={[
            { key: "name", label: "이름", required: true },
            { key: "email", label: "이메일" },
            { key: "dept", label: "부서" },
            { key: "role", label: "역할", type: "select", options: USER_ROLES },
          ]}
        />
      </div>
    </ProtectedShell>
  );
}
