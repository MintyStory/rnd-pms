import type { DocumentStatus } from "@/types";
import { DOCUMENT_STATUS_LABEL } from "@/types";

interface Props {
  status: DocumentStatus;
  setStatus: (s: DocumentStatus) => void;
  reviewerName: string;
  setReviewerName: (v: string) => void;
  approverName: string;
  setApproverName: (v: string) => void;
}

export default function DocumentMetaFields({
  status,
  setStatus,
  reviewerName,
  setReviewerName,
  approverName,
  setApproverName,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 rounded border border-gray-200 bg-white p-4 sm:grid-cols-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">상태</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DocumentStatus)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          {Object.entries(DOCUMENT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">검토자</label>
        <input
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">승인자</label>
        <input
          value={approverName}
          onChange={(e) => setApproverName(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
    </div>
  );
}
