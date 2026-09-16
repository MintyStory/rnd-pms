"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import type { AppUser, DocumentRecord, Product, Project, RevisionEntry } from "@/types";
import { ALL_FORM_TYPES, DOCUMENT_STATUS_LABEL, FORM_TYPE_LABEL } from "@/types";

interface TimelineRow extends RevisionEntry {
  formType: string;
}

export default function DhfPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "projects", projectId), (snap) => {
      if (snap.exists()) setProject({ id: snap.id, ...(snap.data() as Omit<Project, "id">) });
    });
    return () => unsub();
  }, [projectId]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) =>
      setProducts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) })))
    );
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) =>
      setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppUser, "id">) })))
    );
    return () => {
      unsubProducts();
      unsubUsers();
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "documents"), where("projectId", "==", projectId)),
      (snap) =>
        setDocuments(
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

  const product = products.find((p) => p.id === project.productId) ?? null;
  const teamLead = users.find((u) => u.id === project.teamLeadId) ?? null;
  const completedCount = ALL_FORM_TYPES.filter((ft) =>
    documents.some((d) => d.formType === ft)
  ).length;

  const timeline: TimelineRow[] = documents
    .flatMap((d) =>
      d.revisionHistory.map((r) => ({ ...r, formType: d.formType }))
    )
    .sort((a, b) => (a.date + a.formType + a.rev).localeCompare(b.date + b.formType + b.rev));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <ProtectedShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
            ← {project.name}
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
          >
            PDF로 출력
          </button>
        </div>

        <div className="print-root">
          <section className="a4-page cover-page">
            <p className="management-mark">관리 상태 &nbsp;&nbsp; ■ 관리본 &nbsp;&nbsp;&nbsp; □ 비관리본</p>
            <div className="cover-title-block">
              <p className="cover-form-code">DHF</p>
              <h1 className="cover-title">설계이력파일 (Design History File)</h1>
              <p className="cover-subtitle">{project.name}</p>
            </div>
            <table className="revision-table">
              <thead>
                <tr>
                  <th>제품</th>
                  <th>유형</th>
                  <th>개발팀장</th>
                  <th>일정</th>
                  <th>진행상태</th>
                  <th>생성일</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{product?.name ?? "-"}</td>
                  <td>{project.type}</td>
                  <td>{teamLead?.name ?? "-"}</td>
                  <td>
                    {project.startDate ?? "-"} ~ {project.targetDate ?? "-"}
                  </td>
                  <td>{project.status}</td>
                  <td>{today}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="a4-page content-page">
            <header className="content-header">
              <span>설계이력파일(DHF) — 문서 현황</span>
              <span>{project.name}</span>
            </header>

            <div className="content-block">
              <h3>문서 완결성 ({completedCount}/{ALL_FORM_TYPES.length})</h3>
              <table className="revision-table">
                <thead>
                  <tr>
                    <th>양식</th>
                    <th>상태</th>
                    <th>개정횟수</th>
                    <th>최종개정일</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_FORM_TYPES.map((ft) => {
                    const d = documents.find((doc) => doc.formType === ft);
                    const lastRev = d?.revisionHistory[d.revisionHistory.length - 1];
                    return (
                      <tr key={ft}>
                        <td>
                          {ft} {FORM_TYPE_LABEL[ft]}
                        </td>
                        <td>{d ? DOCUMENT_STATUS_LABEL[d.status] : "미작성"}</td>
                        <td>{d?.revisionHistory.length ?? 0}</td>
                        <td>{lastRev?.date ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="content-block">
              <h3>통합 개정이력 (13장 — 설계 및 개발 전체 단계 추적)</h3>
              {timeline.length === 0 ? (
                <p>아직 작성된 문서가 없습니다.</p>
              ) : (
                <table className="revision-table">
                  <thead>
                    <tr>
                      <th>일자</th>
                      <th>양식</th>
                      <th>Rev</th>
                      <th>DCO No</th>
                      <th>개정사유</th>
                      <th>작성</th>
                      <th>검토</th>
                      <th>승인</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map((r, i) => (
                      <tr key={`${r.formType}-${r.rev}-${i}`}>
                        <td>{r.date}</td>
                        <td>{r.formType}</td>
                        <td>{r.rev}</td>
                        <td>{r.dcoNo || "-"}</td>
                        <td>{r.reason}</td>
                        <td>{r.author}</td>
                        <td>{r.reviewer || "-"}</td>
                        <td>{r.approver || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </ProtectedShell>
  );
}
