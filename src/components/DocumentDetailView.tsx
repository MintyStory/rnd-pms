"use client";

import { renderMarkdown } from "@/lib/markdown";
import { resolveFieldValue } from "@/lib/resolve-field-value";
import { FORM_FIELD_CONFIGS } from "@/lib/form-content-config";
import type { Masters } from "@/lib/use-document-view-data";
import RevisionHistoryTable from "@/components/RevisionHistoryTable";
import type { DocumentRecord, FormType } from "@/types";
import { DOCUMENT_STATUS_LABEL } from "@/types";

interface Props {
  formType: FormType;
  docRecord: DocumentRecord | null;
  masters: Masters;
  projectDocuments: DocumentRecord[];
}

export default function DocumentDetailView({
  formType,
  docRecord,
  masters,
  projectDocuments,
}: Props) {
  if (!docRecord) {
    return <p className="text-sm text-gray-400">아직 작성된 문서가 없습니다.</p>;
  }

  const fields = FORM_FIELD_CONFIGS[formType];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 rounded border border-gray-200 bg-white p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-gray-400">상태</p>
          <p>{DOCUMENT_STATUS_LABEL[docRecord.status]}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">검토자</p>
          <p>{docRecord.reviewerName || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">승인자</p>
          <p>{docRecord.approverName || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">개정</p>
          <p>Rev.{docRecord.revisionHistory.length}</p>
        </div>
      </div>

      <div className="space-y-4 rounded border border-gray-200 bg-white p-4">
        {fields.map((f) => {
          const resolved = resolveFieldValue(f, docRecord.content, masters, projectDocuments);
          return (
            <div key={f.key}>
              <p className="text-sm font-medium text-gray-700">{resolved.label}</p>
              {resolved.isMarkdown ? (
                <div
                  className="mt-1 text-sm text-gray-800 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{
                    __html:
                      renderMarkdown(resolved.text) || '<p class="text-gray-400">내용 없음</p>',
                  }}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-800">{resolved.text}</p>
              )}
            </div>
          );
        })}
      </div>

      <RevisionHistoryTable entries={docRecord.revisionHistory} />
    </div>
  );
}
