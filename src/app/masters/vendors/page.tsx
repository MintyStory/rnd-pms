import ProtectedShell from "@/components/ProtectedShell";
import MasterCrud from "@/components/MasterCrud";
import { VENDOR_TYPES } from "@/types";

export default function VendorsPage() {
  return (
    <ProtectedShell>
      <MasterCrud
        collectionName="vendors"
        title="외주업체 마스터"
        fields={[
          { key: "name", label: "업체명", required: true },
          { key: "type", label: "유형", type: "select", options: VENDOR_TYPES },
          { key: "contact", label: "연락처" },
        ]}
      />
    </ProtectedShell>
  );
}
