import type { RevisionEntry } from "@/types";

export default function RevisionHistoryTable({ entries }: { entries: RevisionEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">개정이력</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Rev</th>
            <th className="py-2 pr-4 font-medium">일자</th>
            <th className="py-2 pr-4 font-medium">DCO No</th>
            <th className="py-2 pr-4 font-medium">개정사유</th>
            <th className="py-2 pr-4 font-medium">작성</th>
            <th className="py-2 pr-4 font-medium">검토</th>
            <th className="py-2 font-medium">승인</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((r) => (
            <tr key={r.rev} className="border-b border-gray-100">
              <td className="py-2 pr-4">{r.rev}</td>
              <td className="py-2 pr-4">{r.date}</td>
              <td className="py-2 pr-4">{r.dcoNo ?? "-"}</td>
              <td className="py-2 pr-4">{r.reason}</td>
              <td className="py-2 pr-4">{r.author}</td>
              <td className="py-2 pr-4">{r.reviewer || "-"}</td>
              <td className="py-2">{r.approver || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
