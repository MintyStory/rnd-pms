"use client";

import { renderMarkdown } from "@/lib/markdown";
import { resolveFieldValue } from "@/lib/resolve-field-value";
import { FORM_FIELD_CONFIGS } from "@/lib/form-content-config";
import type { Masters } from "@/lib/use-document-view-data";
import type { DocumentRecord, FormType, Project } from "@/types";
import { FORM_TYPE_LABEL } from "@/types";

interface Props {
  formType: FormType;
  project: Project;
  docRecord: DocumentRecord;
  masters: Masters;
  projectDocuments: DocumentRecord[];
}

export default function DocumentPrintView({
  formType,
  project,
  docRecord,
  masters,
  projectDocuments,
}: Props) {
  const fields = FORM_FIELD_CONFIGS[formType];

  return (
    <div className="print-root">
      <section className="a4-page cover-page">
        <p className="management-mark">관리 상태 &nbsp;&nbsp; ■ 관리본 &nbsp;&nbsp;&nbsp; □ 비관리본</p>
        <div className="cover-title-block">
          <p className="cover-form-code">{formType}</p>
          <h1 className="cover-title">{FORM_TYPE_LABEL[formType]}</h1>
          <p className="cover-subtitle">{project.name}</p>
        </div>
        <table className="revision-table">
          <thead>
            <tr>
              <th>개정번호</th>
              <th>개정일자</th>
              <th>DCO No</th>
              <th>개정사유</th>
              <th>작성</th>
              <th>검토</th>
              <th>승인</th>
            </tr>
          </thead>
          <tbody>
            {docRecord.revisionHistory.map((r) => (
              <tr key={r.rev}>
                <td>{r.rev}</td>
                <td>{r.date}</td>
                <td>{r.dcoNo || "-"}</td>
                <td>{r.reason}</td>
                <td>{r.author}</td>
                <td>{r.reviewer || "-"}</td>
                <td>{r.approver || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="a4-page content-page">
        <header className="content-header">
          <span>
            {formType} {FORM_TYPE_LABEL[formType]}
          </span>
          <span>{project.name}</span>
        </header>
        {fields.map((f) => {
          const resolved = resolveFieldValue(f, docRecord.content, masters, projectDocuments);
          return (
            <div className="content-block" key={f.key}>
              <h3>{resolved.label}</h3>
              {resolved.isMarkdown ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(resolved.text) || "<p>-</p>",
                  }}
                />
              ) : (
                <p>{resolved.text}</p>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
