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
import MarkdownField from "@/components/MarkdownField";
import { useDocumentRecord } from "@/lib/use-document-record";
import type { F702_2_Content, Project, Standard } from "@/types";

const TEXT_FIELDS: { key: keyof F702_2_Content; label: string }[] = [
  { key: "usageRequirements", label: "① 기능/성능/사용적합성/안전성 요구사항" },
  { key: "customerRequirements", label: "③ 고객 사항 및 마케팅 요구사항" },
  { key: "priorDesignInfo", label: "④ 이전 유사 설계로부터 도출된 정보" },
  { key: "otherRequirements", label: "⑤ 기타 필수 요구사항" },
  { key: "riskManagementNote", label: "⑥ 위험관리 계획서 및 산정 결과 (OP-711 연계 요약)" },
  { key: "contractTerms", label: "⑦ 외부 개발계약 조건" },
  { key: "technicalReferences", label: "⑧ 활용 가능한 기술자료" },
  { key: "changeCriteria", label: "⑨ 설계변경 기준 및 적부 판정 기준" },
];

const EMPTY_CONTENT: F702_2_Content = {
  usageRequirements: "",
  standardIds: [],
  customerRequirements: "",
  priorDesignInfo: "",
  otherRequirements: "",
  riskManagementNote: "",
  contractTerms: "",
  technicalReferences: "",
  changeCriteria: "",
};

export default function InputDocumentPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [standards, setStandards] = useState<Standard[]>([]);
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
  } = useDocumentRecord<F702_2_Content>(projectId, "F702-2", EMPTY_CONTENT);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "standards"), (snap) =>
      setStandards(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Standard, "id">) })))
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

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
              ← {project.name}
            </Link>
            <h1 className="mt-2 text-lg font-semibold text-gray-900">
              F702-2 개발 입력서 — {project.name}
            </h1>
          </div>
          <DocumentActionBar projectId={projectId} formPath="input" active="edit" />
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
            <MarkdownField
              label={TEXT_FIELDS[0].label}
              value={content.usageRequirements}
              onChange={(v) => setContent((c) => ({ ...c, usageRequirements: v }))}
              rows={3}
            />

            <LinkedItemsSelect
              label="② 적용 규격 및 법적 요구사항 (규격/법규 마스터에서 선택)"
              options={standards.map((s) => ({ id: s.id, label: `${s.code} ${s.title}` }))}
              selected={content.standardIds}
              onChange={(ids) => setContent((c) => ({ ...c, standardIds: ids }))}
              emptyHint="등록된 규격이 없습니다. 규격/법규 마스터에서 먼저 등록하세요."
            />

            {TEXT_FIELDS.slice(1).map((f) => (
              <MarkdownField
                key={f.key}
                label={f.label}
                value={content[f.key] as string}
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
