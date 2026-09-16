"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import ProtectedShell from "@/components/ProtectedShell";
import DocumentActionBar from "@/components/DocumentActionBar";
import DocumentDetailView from "@/components/DocumentDetailView";
import { useDocumentViewData } from "@/lib/use-document-view-data";
import { PATH_TO_FORM_TYPE } from "@/lib/form-content-config";
import { FORM_TYPE_LABEL } from "@/types";

export default function DocumentViewPage() {
  const params = useParams<{ id: string; formSlug: string }>();
  const projectId = params.id;
  const formType = PATH_TO_FORM_TYPE[params.formSlug] ?? "F702-1";
  const { project, docRecord, projectDocuments, masters } = useDocumentViewData(
    projectId,
    formType
  );

  if (!PATH_TO_FORM_TYPE[params.formSlug]) {
    notFound();
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
            <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
              ← {project.name}
            </Link>
            <h1 className="mt-2 text-lg font-semibold text-gray-900">
              {formType} {FORM_TYPE_LABEL[formType]} — {project.name}
            </h1>
          </div>
          <DocumentActionBar projectId={projectId} formPath={params.formSlug} active="view" />
        </div>

        <DocumentDetailView
          formType={formType}
          docRecord={docRecord}
          masters={masters}
          projectDocuments={projectDocuments}
        />
      </div>
    </ProtectedShell>
  );
}
