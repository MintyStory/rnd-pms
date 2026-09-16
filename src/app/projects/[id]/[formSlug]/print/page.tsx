"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import ProtectedShell from "@/components/ProtectedShell";
import DocumentActionBar from "@/components/DocumentActionBar";
import DocumentPrintView from "@/components/DocumentPrintView";
import { useDocumentViewData } from "@/lib/use-document-view-data";
import { PATH_TO_FORM_TYPE } from "@/lib/form-content-config";

export default function DocumentPrintPage() {
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
      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <Link href={`/projects/${projectId}`} className="text-xs text-blue-600 underline">
            ← {project.name}
          </Link>
          <div className="flex gap-2">
            {docRecord && (
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
              >
                PDF로 출력
              </button>
            )}
            <DocumentActionBar projectId={projectId} formPath={params.formSlug} active="print" />
          </div>
        </div>

        {docRecord ? (
          <DocumentPrintView
            formType={formType}
            project={project}
            docRecord={docRecord}
            masters={masters}
            projectDocuments={projectDocuments}
          />
        ) : (
          <p className="text-sm text-gray-400 print:hidden">
            아직 작성된 문서가 없습니다. 먼저 &ldquo;수정&rdquo;에서 작성해주세요.
          </p>
        )}
      </div>
    </ProtectedShell>
  );
}
