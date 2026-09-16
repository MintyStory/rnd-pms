"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/projects", label: "프로젝트" },
  { href: "/masters/products", label: "제품" },
  { href: "/masters/standards", label: "규격/법규" },
  { href: "/masters/vendors", label: "외주업체" },
  { href: "/masters/components", label: "부품/자재" },
  { href: "/masters/users", label: "사용자/권한" },
];

export default function ProtectedShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { firebaseUser, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
  }, [loading, firebaseUser, router]);

  if (loading || !firebaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 p-4">
        <p className="mb-4 text-sm font-semibold text-gray-900">설계관리 PMS</p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500">
          <p>{profile?.name ?? firebaseUser.email}</p>
          <p>{profile?.role ?? "역할 미지정"}</p>
          <button
            onClick={() => signOut(auth)}
            className="mt-2 text-xs text-gray-400 underline"
          >
            로그아웃
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
