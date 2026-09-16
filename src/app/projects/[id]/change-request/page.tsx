"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import DocumentActionBar from "@/components/DocumentActionBar";
import DocumentMetaFields from "@/components/DocumentMetaFields";
import DocumentSaveBar from "@/components/DocumentSaveBar";
import RevisionHistoryTable from "@/components/RevisionHistoryTable";
import ApprovalGate from "@/components/ApprovalGate";
import MarkdownField from "@/components/MarkdownField";
import { useDocumentRecord } from "@/lib/use-document-record";
import { useAuth } from "@/lib/auth-context";
import type { F702_7_Content, Project, UserRole } from "@/types";
import { CHANGE_IMPORTANCE_LEVELS } from "@/types";

const REQUIRED_ROLES: UserRole[] = ["품질관리팀"];

const EMPTY_CONTENT: F702_7_Content = {
  changeDescription: "",
  importance: "경미한 변경",
  scope: "",
  impactAssessment: "",
  reReviewRequired: false,
};

export default function ChangeRequestPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { profile } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
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
    approvals,
    addApproval,
  } = useDocumentRecord<F702_7_Content>(projectId, "F702-7", EMPTY_CONTENT);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  if (!project) {
    return (
      <ProtectedShell>
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </ProtectedShell>
    );
  }

  const allApproved = REQUIRED_ROLES.every((r) => approvals.some((a) => a.role === r));

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
              ← {project.name}
            </Link>
            <h1 className="mt-2 text-lg font-semibold text-gray-900">
              F702-7 설계변경요청서 — {project.name}
            </h1>
          </div>
          <DocumentActionBar projectId={projectId} formPath="change-request" active="edit" />
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <DocumentMetaFields
            status={status}
            setStatus={setStatus}
            reviewerName={reviewerName}
            setReviewerName={setReviewerName}
            approverName={approverName}
            setApproverName={setApproverName}
            approvedDisabled={!allApproved}
            approvedDisabledHint="12.2 품질관리팀장이 먼저 아래 승인란에서 승인해야 상태를 '승인'으로 바꿀 수 있습니다."
          />

          <div className="space-y-4 rounded border border-gray-200 bg-white p-4">
            <MarkdownField
              label="12.1 변경 사항 및 사유"
              value={content.changeDescription}
              onChange={(v) => setContent((c) => ({ ...c, changeDescription: v }))}
              rows={3}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                12.2 중요성 판단 (품질관리팀장)
              </label>
              <select
                value={content.importance}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    importance: e.target.value as F702_7_Content["importance"],
                  }))
                }
                className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm"
              >
                {CHANGE_IMPORTANCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <MarkdownField
              label="12.2 변경 범위 (해당 설계 및 개발 단계 등)"
              value={content.scope}
              onChange={(v) => setContent((c) => ({ ...c, scope: v }))}
              rows={2}
            />

            <MarkdownField
              label="12.5 영향평가 (구성품/생산중·인도제품/위험관리/제품실현 프로세스 입출력)"
              value={content.impactAssessment}
              onChange={(v) => setContent((c) => ({ ...c, impactAssessment: v }))}
              rows={3}
            />

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={content.reReviewRequired}
                onChange={(e) =>
                  setContent((c) => ({ ...c, reReviewRequired: e.target.checked }))
                }
              />
              12.3 재검토/재검증/재유효성확인이 필요함
            </label>
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

        {docRecord && (
          <ApprovalGate
            requiredRoles={REQUIRED_ROLES}
            approvals={approvals}
            currentUserRole={profile?.role}
            onApprove={addApproval}
          />
        )}

        {docRecord && <RevisionHistoryTable entries={docRecord.revisionHistory} />}
      </div>
    </ProtectedShell>
  );
}
