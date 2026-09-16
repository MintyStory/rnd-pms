import ProtectedShell from "@/components/ProtectedShell";
import MasterCrud from "@/components/MasterCrud";

export default function StandardsPage() {
  return (
    <ProtectedShell>
      <MasterCrud
        collectionName="standards"
        title="관련 규격/법규 마스터"
        fields={[
          { key: "code", label: "규격번호", required: true },
          { key: "title", label: "제목", required: true },
          { key: "region", label: "적용 지역" },
          { key: "note", label: "비고" },
        ]}
      />
    </ProtectedShell>
  );
}
