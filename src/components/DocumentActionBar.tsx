import Link from "next/link";

interface Props {
  projectId: string;
  formPath: string;
  active: "edit" | "view" | "print";
}

export default function DocumentActionBar({ projectId, formPath, active }: Props) {
  const base = `/projects/${projectId}/${formPath}`;
  const items: { key: "edit" | "view" | "print"; label: string; href: string }[] = [
    { key: "edit", label: "수정", href: base },
    { key: "view", label: "상세보기", href: `${base}/view` },
    { key: "print", label: "문서형식보기", href: `${base}/print` },
  ];

  return (
    <div className="flex justify-end gap-2 print:hidden">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            active === item.key
              ? "bg-gray-900 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
