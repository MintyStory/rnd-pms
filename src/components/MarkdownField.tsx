"use client";

import { useState } from "react";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

export default function MarkdownField({ label, value, onChange, rows = 3 }: Props) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded px-2 py-0.5 ${mode === "edit" ? "bg-gray-900 text-white" : "text-gray-500"}`}
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded px-2 py-0.5 ${mode === "preview" ? "bg-gray-900 text-white" : "text-gray-500"}`}
          >
            미리보기
          </button>
        </div>
      </div>
      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder="마크다운 사용 가능: **굵게**, *기울임*, - 목록, # 제목"
          className="rounded border border-gray-300 px-2 py-1.5 font-mono text-sm"
        />
      ) : (
        <div
          className="min-h-12 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm [&_code]:rounded [&_code]:bg-gray-200 [&_code]:px-1 [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(value) || '<p class="text-gray-400">내용 없음</p>',
          }}
        />
      )}
    </div>
  );
}
