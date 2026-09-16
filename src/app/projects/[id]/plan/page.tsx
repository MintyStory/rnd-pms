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
import MarkdownField from "@/components/MarkdownField";
import { useDocumentRecord } from "@/lib/use-document-record";
import type { F702_1_Content, Project } from "@/types";

const FIELDS: { key: keyof F702_1_Content; label: string }[] = [
  { key: "purposeAndRequirements", label: "① 기능/성능/사용적합성/안전 요구사항" },
  { key: "schedule", label: "② 설계 및 개발 일정 프로그램" },
  { key: "roles", label: "③ 업무분장 및 책임과 권한" },
  { key: "workBreakdown", label: "④ 업무 명세 구조도" },
  { key: "stageReviews", label: "⑤ 단계별 검토사항" },
  { key: "resources", label: "⑥ 재원/인력/시설 등 자원" },
  { key: "regulatoryRequirements", label: "⑦ 적용 규제요구사항 및 품질계획/절차/규격 관리" },
  { key: "outputs", label: "⑧ 개발 과정별 출력물 종류" },
];

const EMPTY_CONTENT: F702_1_Content = {
  purposeAndRequirements: "",
  schedule: "",
  roles: "",
  workBreakdown: "",
  stageReviews: "",
  resources: "",
  regulatoryRequirements: "",
  outputs: "",
};

export default function PlanDocumentPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

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
  } = useDocumentRecord<F702_1_Content>(projectId, "F702-1", EMPTY_CONTENT);

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

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
              ← {project.name}
            </Link>
            <h1 className="mt-2 text-lg font-semibold text-gray-900">
              F702-1 개발 계획서 — {project.name}
            </h1>
          </div>
          <DocumentActionBar projectId={projectId} formPath="plan" active="edit" />
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
            {FIELDS.map((f) => (
              <MarkdownField
                key={f.key}
                label={f.label}
                value={content[f.key]}
                onChange={(v) => setContent((c) => ({ ...c, [f.key]: v }))}
                rows={3}
              />
            ))}
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
