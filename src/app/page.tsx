import Link from "next/link";
import ProtectedShell from "@/components/ProtectedShell";
import WeatherWidget from "@/components/WeatherWidget";

const CARDS = [
  { href: "/projects", label: "프로젝트", desc: "개발과제 생성 및 F702-1 개발계획서" },
  { href: "/masters/products", label: "제품", desc: "공통 제품 마스터 관리" },
  { href: "/masters/standards", label: "규격/법규", desc: "설계입력에서 참조하는 규격 마스터" },
  { href: "/masters/vendors", label: "외주업체", desc: "외주생산/시험/자문 업체 마스터" },
  { href: "/masters/components", label: "부품/자재", desc: "BOM에 사용되는 부품/원자재 마스터" },
  { href: "/masters/users", label: "사용자/권한", desc: "부서/역할(4장 책임과 권한) 관리" },
];

export default function DashboardPage() {
  return (
    <ProtectedShell>
      <div className="space-y-6">
        <WeatherWidget />
        <div>
          <h1 className="text-lg font-semibold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500">
            Phase 5: 프로젝트 상세 화면의 &ldquo;DHF 보기&rdquo;에서 설계이력파일(DHF)
            통합 뷰(문서 완결성 현황 + 전체 개정이력 타임라인)를 A4 인쇄/PDF로 확인할 수
            있습니다.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-400"
            >
              <p className="font-medium text-gray-900">{c.label}</p>
              <p className="mt-1 text-xs text-gray-500">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedShell>
  );
}
