"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import DocumentActionBar from "@/components/DocumentActionBar";
import DocumentMetaFields from "@/components/DocumentMetaFields";
import DocumentSaveBar from "@/components/DocumentSaveBar";
import RevisionHistoryTable from "@/components/RevisionHistoryTable";
import LinkedItemsSelect from "@/components/LinkedItemsSelect";
import ApprovalGate from "@/components/ApprovalGate";
import MarkdownField from "@/components/MarkdownField";
import { useDocumentRecord } from "@/lib/use-document-record";
import { useAuth } from "@/lib/auth-context";
import type { F702_8_Content, Project, UserRole, Vendor } from "@/types";
import { TRANSFER_ITEMS, TRANSFER_METHODS } from "@/types";

const REQUIRED_ROLES: UserRole[] = ["품질책임자", "CEO"];

const EMPTY_CONTENT: F702_8_Content = {
  transferMethod: TRANSFER_METHODS[0],
  transferredItems: [],
  receiverVendorId: "",
  receiverName: "",
  receivedDate: "",
  postMarketUpdateNote: "",
};

export default function TransferReportPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const { profile } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
  } = useDocumentRecord<F702_8_Content>(projectId, "F702-8", EMPTY_CONTENT);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "vendors"), (snap) =>
      setVendors(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vendor, "id">) })))
    );
    return () => unsub();
  }, []);

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
              F702-8 설계 및 개발 이관보고서 — {project.name}
            </h1>
          </div>
          <DocumentActionBar projectId={projectId} formPath="transfer" active="edit" />
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
            approvedDisabledHint="4.1/4.3 규정에 따라 CEO와 품질책임자가 아래 승인란에서 모두 승인해야 상태를 '승인'으로 바꿀 수 있습니다."
          />

          <div className="space-y-4 rounded border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">11.1 이관 방법</label>
              <select
                value={content.transferMethod}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    transferMethod: e.target.value as F702_8_Content["transferMethod"],
                  }))
                }
                className="w-56 rounded border border-gray-300 px-2 py-1.5 text-sm"
              >
                {TRANSFER_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <LinkedItemsSelect
              label="11.1(2) 이관 대상 정보"
              options={TRANSFER_ITEMS.map((i) => ({ id: i, label: i }))}
              selected={content.transferredItems}
              onChange={(ids) => setContent((c) => ({ ...c, transferredItems: ids }))}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  이관받는 자 (이름)
                </label>
                <input
                  value={content.receiverName}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, receiverName: e.target.value }))
                  }
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  외주 생산업체 (해당 시)
                </label>
                <select
                  value={content.receiverVendorId}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, receiverVendorId: e.target.value }))
                  }
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="">선택 안함 (내부 이관)</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">이관일자</label>
                <input
                  type="date"
                  value={content.receivedDate}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, receivedDate: e.target.value }))
                  }
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>

            <MarkdownField
              label="11.2 판매 후 정보 반영"
              value={content.postMarketUpdateNote}
              onChange={(v) => setContent((c) => ({ ...c, postMarketUpdateNote: v }))}
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
