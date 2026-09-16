import ProtectedShell from "@/components/ProtectedShell";
import MasterCrud from "@/components/MasterCrud";

export default function ProductsPage() {
  return (
    <ProtectedShell>
      <MasterCrud
        collectionName="products"
        title="제품 마스터"
        fields={[
          { key: "name", label: "제품명", required: true },
          { key: "category", label: "분류" },
          { key: "spec", label: "규격" },
        ]}
      />
    </ProtectedShell>
  );
}
