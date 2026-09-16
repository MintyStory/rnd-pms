"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import DocumentMetaFields from "@/components/DocumentMetaFields";
import DocumentSaveBar from "@/components/DocumentSaveBar";
import RevisionHistoryTable from "@/components/RevisionHistoryTable";
import LinkedItemsSelect from "@/components/LinkedItemsSelect";
import { useDocumentRecord } from "@/lib/use-document-record";
import type { Component, F702_3_Content, Project } from "@/types";

const TEXT_FIELDS: { key: keyof F702_3_Content; label: string }[] = [
  { key: "drawingNote", label: "(2) 도면 설명 (파일은 아래 첨부 영역에 업로드)" },
  { key: "materialSpec", label: "(3) 원자재/부품 사양 및 근거자료" },
  { key: "manufacturingProcess", label: "(4) 제조 공정" },
  { key: "productSpec", label: "(5) 제품 사양 및 근거자료" },
  { key: "verificationPlanSummary", label: "(6) 검증 계획 요약" },
];

const EMPTY_CONTENT: F702_3_Content = {
  componentIds: [],
  drawingNote: "",
  materialSpec: "",
  manufacturingProcess: "",
  productSpec: "",
  verificationPlanSummary: "",
};

export default function OutputDocumentPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
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
  } = useDocumentRecord<F702_3_Content>(projectId, "F702-3", EMPTY_CONTENT);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "components"), (snap) =>
      setComponents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Component, "id">) })))
    );
    return () => unsub();
  }, []);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !docRecord) return;
    setUploading(true);
    try {
      const path = `documents/${docRecord.id}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const attachments = [
        ...(docRecord.attachments ?? []),
        {
          name: file.name,
          storagePath: path,
          url,
          uploadedAt: new Date().toISOString(),
        },
      ];
      await updateDoc(doc(db, "documents", docRecord.id), { attachments });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

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
            F702-3 개발 출력서 — {project.name}
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
            <LinkedItemsSelect
              label="(1) 부품/원자재 목록 (부품/자재 마스터에서 선택)"
              options={components.map((c) => ({ id: c.id, label: c.name }))}
              selected={content.componentIds}
              onChange={(ids) => setContent((c) => ({ ...c, componentIds: ids }))}
              emptyHint="등록된 부품/자재가 없습니다. 부품/자재 마스터에서 먼저 등록하세요."
            />

            {TEXT_FIELDS.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{f.label}</label>
                <textarea
                  value={content[f.key]}
                  onChange={(e) =>
                    setContent((c) => ({ ...c, [f.key]: e.target.value }))
                  }
                  rows={3}
                  className="rounded border border-gray-300 px-2 py-1.5 text-sm"
                />
              </div>
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

        <div className="rounded border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">첨부파일 (도면 등)</h2>
          {!docRecord ? (
            <p className="mt-2 text-xs text-gray-400">
              먼저 위에서 &ldquo;최초 저장&rdquo;을 눌러 문서를 생성한 뒤 첨부파일을 업로드할 수 있습니다.
            </p>
          ) : (
            <>
              <div className="mt-3 flex items-center gap-3">
                <input ref={fileInputRef} type="file" className="text-sm" />
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50"
                >
                  {uploading ? "업로드 중..." : "업로드"}
                </button>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {(docRecord.attachments ?? []).map((a) => (
                  <li key={a.storagePath}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {a.name}
                    </a>
                  </li>
                ))}
                {(docRecord.attachments ?? []).length === 0 && (
                  <li className="text-xs text-gray-400">첨부된 파일이 없습니다.</li>
                )}
              </ul>
            </>
          )}
        </div>

        {docRecord && <RevisionHistoryTable entries={docRecord.revisionHistory} />}
      </div>
    </ProtectedShell>
  );
}
