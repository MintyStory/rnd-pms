import type { FieldConfig } from "@/lib/form-content-config";
import type { Masters } from "@/lib/use-document-view-data";
import type { DocumentRecord } from "@/types";
import { FORM_TYPE_LABEL } from "@/types";

export interface ResolvedField {
  label: string;
  isMarkdown: boolean;
  text: string;
}

export function resolveFieldValue(
  field: FieldConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>,
  masters: Masters,
  projectDocuments: DocumentRecord[]
): ResolvedField {
  const value = content?.[field.key];

  if (field.kind === "markdown") {
    return { label: field.label, isMarkdown: true, text: (value as string) || "" };
  }

  if (field.kind === "text") {
    return { label: field.label, isMarkdown: false, text: (value as string) || "-" };
  }

  if (field.kind === "boolean") {
    return { label: field.label, isMarkdown: false, text: value ? "예" : "아니오" };
  }

  if (field.kind === "linked-static") {
    const items = (value as string[]) ?? [];
    return { label: field.label, isMarkdown: false, text: items.length ? items.join(", ") : "-" };
  }

  if (field.kind === "linked" || field.kind === "linked-single") {
    const collection = masters[field.linkedCollection!];
    const nameOf = (id: string) => {
      const item = collection.find((c) => c.id === id);
      if (!item) return null;
      if ("code" in item) return `${item.code} ${item.title}`;
      return item.name;
    };
    if (field.kind === "linked-single") {
      const id = value as string;
      if (!id) return { label: field.label, isMarkdown: false, text: "-" };
      return { label: field.label, isMarkdown: false, text: nameOf(id) ?? "-" };
    }
    const ids = (value as string[]) ?? [];
    const names = ids.map((id) => nameOf(id)).filter((n): n is string => !!n);
    return { label: field.label, isMarkdown: false, text: names.length ? names.join(", ") : "-" };
  }

  if (field.kind === "linked-doc") {
    const ids = (value as string[]) ?? [];
    const names = ids
      .map((id) => projectDocuments.find((d) => d.id === id))
      .filter((d): d is DocumentRecord => !!d)
      .map((d) => `${d.formType} ${FORM_TYPE_LABEL[d.formType]}`);
    return { label: field.label, isMarkdown: false, text: names.length ? names.join(", ") : "-" };
  }

  return { label: field.label, isMarkdown: false, text: "" };
}
