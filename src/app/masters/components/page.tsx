import ProtectedShell from "@/components/ProtectedShell";
import MasterCrud from "@/components/MasterCrud";

export default function ComponentsPage() {
  return (
    <ProtectedShell>
      <MasterCrud
        collectionName="components"
        title="부품/원자재 마스터"
        fields={[
          { key: "name", label: "품명", required: true },
          { key: "spec", label: "규격" },
          { key: "unit", label: "단위" },
          { key: "note", label: "비고" },
        ]}
      />
    </ProtectedShell>
  );
}
