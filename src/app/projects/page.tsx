"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProtectedShell from "@/components/ProtectedShell";
import type { AppUser, Product, Project, ProjectType } from "@/types";
import { PROJECT_TYPES } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("신규개발");
  const [productId, setProductId] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "projects"), orderBy("name")),
      (snap) =>
        setProjects(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }))
        )
    );
    return () => unsub();
  }, []);

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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await addDoc(collection(db, "projects"), {
      name,
      type,
      productId: productId || null,
      teamLeadId: teamLeadId || null,
      status: "타당성검토",
      startDate: startDate || null,
      targetDate: targetDate || null,
    });
    setName("");
    setProductId("");
    setTeamLeadId("");
    setStartDate("");
    setTargetDate("");
  }

  function productName(id?: string) {
    return products.find((p) => p.id === id)?.name ?? "-";
  }
  function userName(id?: string) {
    return users.find((u) => u.id === id)?.name ?? "-";
  }

  return (
    <ProtectedShell>
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-gray-900">프로젝트(개발과제)</h1>

        <form
          onSubmit={handleCreate}
          className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">프로젝트명</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">유형</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProjectType)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">제품</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">선택</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">개발팀장/담당자</label>
            <select
              value={teamLeadId}
              onChange={(e) => setTeamLeadId(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">선택</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">목표완료일</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
          >
            생성
          </button>
        </form>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-4 font-medium">프로젝트명</th>
              <th className="py-2 pr-4 font-medium">유형</th>
              <th className="py-2 pr-4 font-medium">제품</th>
              <th className="py-2 pr-4 font-medium">개발팀장</th>
              <th className="py-2 pr-4 font-medium">상태</th>
              <th className="py-2 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-2 pr-4">{p.name}</td>
                <td className="py-2 pr-4">{p.type}</td>
                <td className="py-2 pr-4">{productName(p.productId)}</td>
                <td className="py-2 pr-4">{userName(p.teamLeadId)}</td>
                <td className="py-2 pr-4">{p.status}</td>
                <td className="py-2">
                  <Link href={`/projects/${p.id}`} className="text-xs text-blue-600 underline">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">
                  등록된 프로젝트가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ProtectedShell>
  );
}
