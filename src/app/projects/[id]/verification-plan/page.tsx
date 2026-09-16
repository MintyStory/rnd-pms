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
import type { F702_5_Content, Project, Standard } from "@/types";
import { VALIDATION_METHODS } from "@/types";

const TEXT_FIELDS: { key: keyof F702_5_Content; label: string }[] = [
  { key: "protocolPurpose", label: "② 프로토콜의 목적" },
  { key: "proceduresAndSpecs", label: "③ 수행되는 절차와 명세(spec)" },
  { key: "modelSelectionRationale", label: "⑤ 사용될 모델 선정 근거" },
  { key: "facilitiesAndEquipment", label: "⑥ 시설/장비/시험장비 설명" },
  { key: "performers", label: "⑦ 검증 활동 수행자 설명" },
  { key: "referencedDocuments", label: "⑧ 절차서/표준/스펙/기록에 대한 설명" },
  { key: "sampleSizeStatistics", label: "⑨ 샘플크기 등 통계적 검증 결과" },
];

const EMPTY_CONTENT: F702_5_Content = {
  protocolPurpose: "",
  proceduresAndSpecs: "",
  standardIds: [],
  modelSelectionRationale: "",
  facilitiesAndEquipment: "",
  performers: "",
  referencedDocuments: "",
  sampleSizeStatistics: "",
  methods: [],
};

export default function VerificationPlanPage() {
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
  } = useDocumentRecord<F702_5_Content>(projectId, "F702-5", EMPTY_CONTENT);

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
              F702-5 검증 및 유효성확인 계획서 — {project.name}
            </h1>
          </div>
          <DocumentActionBar
            projectId={projectId}
            formPath="verification-plan"
            active="edit"
          />
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
              value={content.protocolPurpose}
              onChange={(v) => setContent((c) => ({ ...c, protocolPurpose: v }))}
              rows={2}
            />
            <MarkdownField
              label={TEXT_FIELDS[1].label}
              value={content.proceduresAndSpecs}
              onChange={(v) => setContent((c) => ({ ...c, proceduresAndSpecs: v }))}
              rows={2}
            />

            <LinkedItemsSelect
              label="④ 적용 규격 (규격/법규 마스터에서 선택)"
              options={standards.map((s) => ({ id: s.id, label: `${s.code} ${s.title}` }))}
              selected={content.standardIds}
              onChange={(ids) => setContent((c) => ({ ...c, standardIds: ids }))}
              emptyHint="등록된 규격이 없습니다."
            />

            {TEXT_FIELDS.slice(2).map((f) => (
              <MarkdownField
                key={f.key}
                label={f.label}
                value={content[f.key] as string}
                onChange={(v) => setContent((c) => ({ ...c, [f.key]: v }))}
                rows={2}
              />
            ))}

            <LinkedItemsSelect
              label="검증/유효성확인 방법 (9.1 / 10.2)"
              options={VALIDATION_METHODS.map((m) => ({ id: m, label: m }))}
              selected={content.methods}
              onChange={(ids) => setContent((c) => ({ ...c, methods: ids }))}
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
