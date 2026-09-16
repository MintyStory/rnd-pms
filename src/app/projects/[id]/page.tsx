"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, onSnapshot, updateDoc, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import type { AppUser, DocumentRecord, Product, Project } from "@/types";
import { ALL_FORM_TYPES, PROJECT_STATUSES, DOCUMENT_STATUS_LABEL, FORM_TYPE_LABEL } from "@/types";
import { FORM_TYPE_TO_PATH } from "@/lib/form-content-config";

export default function ProjectDetailPage() {
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

  const product = products.find((p) => p.id === project?.productId) ?? null;
  const teamLead = users.find((u) => u.id === project?.teamLeadId) ?? null;

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

  async function handleStatusChange(status: string) {
    await updateDoc(doc(db, "projects", projectId), { status });
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/projects" className="text-xs text-blue-600 underline">
              ← 프로젝트 목록
            </Link>
            <h1 className="mt-2 text-lg font-semibold text-gray-900">{project.name}</h1>
          </div>
          <Link
            href={`/projects/${projectId}/dhf`}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            DHF 보기
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded border border-gray-200 bg-white p-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-400">유형</p>
            <p>{project.type}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">제품</p>
            <p>{product?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">개발팀장/담당자</p>
            <p>{teamLead?.name ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">일정</p>
            <p>
              {project.startDate ?? "-"} ~ {project.targetDate ?? "-"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-4">
            <p className="text-xs text-gray-400">진행 상태</p>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="mt-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">설계 및 개발 문서</h2>
          </div>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">양식</th>
                <th className="py-2 pr-4 font-medium">상태</th>
                <th className="py-2 pr-4 font-medium">버전</th>
                <th className="py-2 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {ALL_FORM_TYPES.map((formType) => {
                const d = documents.find((doc) => doc.formType === formType);
                return (
                  <tr key={formType} className="border-b border-gray-100">
                    <td className="py-2 pr-4">
                      {formType} {FORM_TYPE_LABEL[formType]}
                    </td>
                    <td className="py-2 pr-4">
                      {d ? DOCUMENT_STATUS_LABEL[d.status] : "미작성"}
                    </td>
                    <td className="py-2 pr-4">{d?.revisionHistory?.length ?? 0}</td>
                    <td className="py-2">
                      <Link
                        href={`/projects/${projectId}/${FORM_TYPE_TO_PATH[formType]}`}
                        className="text-xs text-blue-600 underline"
                      >
                        {d ? "열기" : "작성"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedShell>
  );
}
