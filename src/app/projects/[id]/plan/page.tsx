"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import { useAuth } from "@/lib/auth-context";
import type { DocumentRecord, DocumentStatus, F702_1_Content, Project } from "@/types";
import { DOCUMENT_STATUS_LABEL } from "@/types";

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
  const { profile, firebaseUser } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [docRecord, setDocRecord] = useState<DocumentRecord | null>(null);
  const [content, setContent] = useState<F702_1_Content>(EMPTY_CONTENT);
  const [status, setStatus] = useState<DocumentStatus>("draft");
  const [reviewerName, setReviewerName] = useState("");
  const [approverName, setApproverName] = useState("");
  const [reason, setReason] = useState("");
  const [dcoNo, setDcoNo] = useState("");
  const [saving, setSaving] = useState(false);

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
        where("formType", "==", "F702-1")
      ),
      (snap) => {
        if (snap.empty) {
          setDocRecord(null);
          return;
        }
        const d = snap.docs[0];
        const record = { id: d.id, ...(d.data() as Omit<DocumentRecord, "id">) };
        setDocRecord(record);
        setContent(record.content);
        setStatus(record.status);
        setReviewerName(record.reviewerName ?? "");
        setApproverName(record.approverName ?? "");
      }
    );
    return () => unsub();
  }, [projectId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const authorName = profile?.name ?? firebaseUser?.email ?? "알수없음";
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (!docRecord) {
        await addDoc(collection(db, "documents"), {
          projectId,
          formType: "F702-1",
          status,
          reviewerName,
          approverName,
          content,
          revisionHistory: [
            {
              rev: 1,
              date: today,
              dcoNo: dcoNo || null,
              reason: reason || "최초 작성",
              author: authorName,
              reviewer: reviewerName,
              approver: approverName,
            },
          ],
        });
      } else {
        const nextRev = (docRecord.revisionHistory?.length ?? 0) + 1;
        await updateDoc(doc(db, "documents", docRecord.id), {
          status,
          reviewerName,
          approverName,
          content,
          revisionHistory: [
            ...docRecord.revisionHistory,
            {
              rev: nextRev,
              date: today,
              dcoNo: dcoNo || null,
              reason: reason || "내용 수정",
              author: authorName,
              reviewer: reviewerName,
              approver: approverName,
            },
          ],
        });
      }
      setReason("");
      setDcoNo("");
    } finally {
      setSaving(false);
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
            F702-1 개발 계획서 — {project.name}
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 rounded border border-gray-200 bg-white p-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              >
                {Object.entries(DOCUMENT_STATUS_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">검토자</label>
              <input
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">승인자</label>
              <input
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 rounded border border-gray-200 bg-white p-4">
            {FIELDS.map((f) => (
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

          <div className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">개정사유 (이번 저장)</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={docRecord ? "내용 수정" : "최초 작성"}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">DCO No</label>
              <input
                value={dcoNo}
                onChange={(e) => setDcoNo(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "저장 중..." : docRecord ? "수정 저장 (개정)" : "최초 저장"}
            </button>
          </div>
        </form>

        {docRecord && docRecord.revisionHistory.length > 0 && (
          <div className="rounded border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">개정이력</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">Rev</th>
                  <th className="py-2 pr-4 font-medium">일자</th>
                  <th className="py-2 pr-4 font-medium">DCO No</th>
                  <th className="py-2 pr-4 font-medium">개정사유</th>
                  <th className="py-2 pr-4 font-medium">작성</th>
                  <th className="py-2 pr-4 font-medium">검토</th>
                  <th className="py-2 font-medium">승인</th>
                </tr>
              </thead>
              <tbody>
                {docRecord.revisionHistory.map((r) => (
                  <tr key={r.rev} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{r.rev}</td>
                    <td className="py-2 pr-4">{r.date}</td>
                    <td className="py-2 pr-4">{r.dcoNo ?? "-"}</td>
                    <td className="py-2 pr-4">{r.reason}</td>
                    <td className="py-2 pr-4">{r.author}</td>
                    <td className="py-2 pr-4">{r.reviewer || "-"}</td>
                    <td className="py-2">{r.approver || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedShell>
  );
}
