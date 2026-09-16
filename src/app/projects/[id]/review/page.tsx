"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import DocumentActionBar from "@/components/DocumentActionBar";
import DocumentMetaFields from "@/components/DocumentMetaFields";
import DocumentSaveBar from "@/components/DocumentSaveBar";
import RevisionHistoryTable from "@/components/RevisionHistoryTable";
import LinkedItemsSelect from "@/components/LinkedItemsSelect";
import MarkdownField from "@/components/MarkdownField";
import { useDocumentRecord } from "@/lib/use-document-record";
import type { AppUser, DocumentRecord, F702_4_Content, Project } from "@/types";
import { FORM_TYPE_LABEL, REVIEW_DECISIONS } from "@/types";

const EMPTY_CONTENT: F702_4_Content = {
  meetingDate: "",
  attendeeIds: [],
  reviewedDocumentIds: [],
  reviewCriteria: "",
  complianceEvidence: "",
  decision: "진행",
  revisions: "",
  revisionReason: "",
};

export default function ReviewDocumentPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [projectDocuments, setProjectDocuments] = useState<DocumentRecord[]>([]);
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
  } = useDocumentRecord<F702_4_Content>(projectId, "F702-4", EMPTY_CONTENT);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) =>
      setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppUser, "id">) })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "documents"), where("projectId", "==", projectId)),
      (snap) =>
        setProjectDocuments(
          snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<DocumentRecord, "id">) }))
            .filter((d) => d.formType !== "F702-4")
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
              ← {project.name}
            </Link>
            <h1 className="mt-2 text-lg font-semibold text-gray-900">
              F702-4 설계검토회의록 — {project.name}
            </h1>
          </div>
          <DocumentActionBar projectId={projectId} formPath="review" active="edit" />
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
              <label className="text-sm font-medium text-gray-700">회의일자</label>
              <input
                type="date"
                value={content.meetingDate}
                onChange={(e) => setContent((c) => ({ ...c, meetingDate: e.target.value }))}
                className="w-48 rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>

            <LinkedItemsSelect
              label="참석자 (사용자 마스터에서 선택, 팀장은 8.1에 따라 영업부서장)"
              options={users.map((u) => ({ id: u.id, label: `${u.name}${u.role ? ` (${u.role})` : ""}` }))}
              selected={content.attendeeIds}
              onChange={(ids) => setContent((c) => ({ ...c, attendeeIds: ids }))}
            />

            <MarkdownField
              label="① 설계 및 개발검토의 기준"
              value={content.reviewCriteria}
              onChange={(v) => setContent((c) => ({ ...c, reviewCriteria: v }))}
              rows={2}
            />

            <LinkedItemsSelect
              label="② 검토한 문서 목록 (이 프로젝트에서 작성된 문서 중 선택)"
              options={projectDocuments.map((d) => ({
                id: d.id,
                label: `${d.formType} ${FORM_TYPE_LABEL[d.formType]}`,
              }))}
              selected={content.reviewedDocumentIds}
              onChange={(ids) => setContent((c) => ({ ...c, reviewedDocumentIds: ids }))}
              emptyHint="이 프로젝트에 먼저 작성된 F702 문서가 없습니다."
            />

            <MarkdownField
              label="③ 요구사항 충족 증거"
              value={content.complianceEvidence}
              onChange={(v) => setContent((c) => ({ ...c, complianceEvidence: v }))}
              rows={3}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                ④ 다음 단계 진행 여부
              </label>
              <select
                value={content.decision}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    decision: e.target.value as F702_4_Content["decision"],
                  }))
                }
                className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm"
              >
                {REVIEW_DECISIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <MarkdownField
              label="⑤ 수정한 내용"
              value={content.revisions}
              onChange={(v) => setContent((c) => ({ ...c, revisions: v }))}
              rows={2}
            />

            <MarkdownField
              label="⑥ 수정 사유 및 제안사항"
              value={content.revisionReason}
              onChange={(v) => setContent((c) => ({ ...c, revisionReason: v }))}
              rows={2}
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
