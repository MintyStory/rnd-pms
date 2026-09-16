"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface MasterField {
  key: string;
  label: string;
  type?: "text" | "select";
  options?: string[];
  required?: boolean;
}

interface MasterCrudProps {
  collectionName: string;
  title: string;
  fields: MasterField[];
}

type Row = { id: string } & Record<string, string>;

export default function MasterCrud({
  collectionName,
  title,
  fields,
}: MasterCrudProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, collectionName), (snap) => {
      setRows(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Record<string, string>) }))
      );
    });
    return () => unsub();
  }, [collectionName]);

  function startEdit(row: Row) {
    setEditingId(row.id);
    const next: Record<string, string> = {};
    fields.forEach((f) => (next[f.key] = row[f.key] ?? ""));
    setForm(next);
  }

  function resetForm() {
    setEditingId(null);
    setForm({});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateDoc(doc(db, collectionName, editingId), form);
    } else {
      await addDoc(collection(db, collectionName), form);
    }
    resetForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, collectionName, id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-4"
      >
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">{f.label}</label>
            {f.type === "select" ? (
              <select
                required={f.required}
                value={form[f.key] ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, [f.key]: e.target.value }))
                }
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">선택</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required={f.required}
                value={form[f.key] ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, [f.key]: e.target.value }))
                }
                className="rounded border border-gray-300 px-2 py-1.5 text-sm"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          {editingId ? "수정 저장" : "추가"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600"
          >
            취소
          </button>
        )}
      </form>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            {fields.map((f) => (
              <th key={f.key} className="py-2 pr-4 font-medium">
                {f.label}
              </th>
            ))}
            <th className="py-2 font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100">
              {fields.map((f) => (
                <td key={f.key} className="py-2 pr-4">
                  {row[f.key]}
                </td>
              ))}
              <td className="py-2 space-x-3">
                <button
                  onClick={() => startEdit(row)}
                  className="text-xs text-blue-600 underline"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-xs text-red-600 underline"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={fields.length + 1} className="py-6 text-center text-gray-400">
                등록된 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
