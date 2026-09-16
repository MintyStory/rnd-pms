interface Props {
  reason: string;
  setReason: (v: string) => void;
  dcoNo: string;
  setDcoNo: (v: string) => void;
  saving: boolean;
  hasExisting: boolean;
}

export default function DocumentSaveBar({
  reason,
  setReason,
  dcoNo,
  setDcoNo,
  saving,
  hasExisting,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">개정사유 (이번 저장)</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={hasExisting ? "내용 수정" : "최초 작성"}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">DCO No</label>
        <input
          value={dcoNo}
          onChange={(e) => setDcoNo(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "저장 중..." : hasExisting ? "수정 저장 (개정)" : "최초 저장"}
      </button>
    </div>
  );
}
