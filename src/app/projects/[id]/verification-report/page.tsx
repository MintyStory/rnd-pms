"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import DocumentMetaFields from "@/components/DocumentMetaFields";
import DocumentSaveBar from "@/components/DocumentSaveBar";
import RevisionHistoryTable from "@/components/RevisionHistoryTable";
import LinkedItemsSelect from "@/components/LinkedItemsSelect";
import { useDocumentRecord } from "@/lib/use-document-record";
import type { DocumentRecord, F702_6_Content, Project } from "@/types";
import { COMPLIANCE_STATUSES } from "@/types";

const EMPTY_CONTENT: F702_6_Content = {
  resultsSummary: "",
  complianceStatus: "부합",
  nonComplianceAction: "",
  relatedChangeRequestIds: [],
};

export default function VerificationReportPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [changeRequests, setChangeRequests] = useState<DocumentRecord[]>([]);
  const {
    docRecord,
    content,
    setContent,
    status,
    setStatus,
    reviewerName,
    setReviewerName,
    approverName,
    setApproverName,
    reason,
    setReason,
    dcoNo,
    setDcoNo,
    saving,
    handleSave,
  } = useDocumentRecord<F702_6_Content>(projectId, "F702-6", EMPTY_CONTENT);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db, "documents"),
        where("projectId", "==", projectId),
        where("formType", "==", "F702-7")
      ),
      (snap) =>
        setChangeRequests(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DocumentRecord, "id">) }))
        )
    );
    return () => unsub();
  }, [projectId]);

  if (!project) {
    return (
      <ProtectedShell>
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </ProtectedShell>
    );
  }

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div>
          <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
            ← {project.name}
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-gray-900">
            F702-6 검증 및 유효성확인 보고서 — {project.name}
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <DocumentMetaFields
            status={status}
            setStatus={setStatus}
            reviewerName={reviewerName}
            setReviewerName={setReviewerName}
            approverName={approverName}
            setApproverName={setApproverName}
          />

          <div className="space-y-4 rounded border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                검증/유효성확인 결과 요약 (9.2.3(1))
              </label>
              <textarea
                value={content.resultsSummary}
                onChange={(e) =>
                  setContent((c) => ({ ...c, resultsSummary: e.target.value }))
                }
                rows={3}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                고객요건/적용사양 부합 여부 (9.2.3(2))
              </label>
              <select
                value={content.complianceStatus}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    complianceStatus: e.target.value as F702_6_Content["complianceStatus"],
                  }))
                }
                className="w-32 rounded border border-gray-300 px-2 py-1.5 text-sm"
              >
                {COMPLIANCE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {content.complianceStatus === "불부합" && (
              <div className="flex flex-col gap-1 rounded border border-amber-200 bg-amber-50 p-3">
                <label className="text-sm font-medium text-gray-700">
                  불부합 시 조치 (9.2.3(3) — 요구조건/적용사양에 부합하도록 설계 변경)
                </label>
                <textarea
                  value={content.nonComplianceAction}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, nonComplianceAction: e.target.value }))
                  }
                  rows={2}
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
                <p className="text-xs text-amber-700">
                  설계변경이 필요하면 F702-7 설계변경요청서를 작성한 뒤 아래에서 연결하세요.
                </p>
              </div>
            )}

            <LinkedItemsSelect
              label="관련 F702-7 설계변경요청서"
              options={changeRequests.map((d) => ({
                id: d.id,
                label: `변경요청 (${d.revisionHistory.length}차 개정)`,
              }))}
              selected={content.relatedChangeRequestIds}
              onChange={(ids) =>
                setContent((c) => ({ ...c, relatedChangeRequestIds: ids }))
              }
              emptyHint="이 프로젝트에 작성된 F702-7 문서가 없습니다."
            />
          </div>

          <DocumentSaveBar
            reason={reason}
            setReason={setReason}
            dcoNo={dcoNo}
            setDcoNo={setDcoNo}
            saving={saving}
            hasExisting={!!docRecord}
          />
        </form>

        {docRecord && <RevisionHistoryTable entries={docRecord.revisionHistory} />}
      </div>
    </ProtectedShell>
  );
}
