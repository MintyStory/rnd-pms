import type { FormType } from "@/types";

export const PATH_TO_FORM_TYPE: Record<string, FormType> = {
  plan: "F702-1",
  input: "F702-2",
  output: "F702-3",
  review: "F702-4",
  "verification-plan": "F702-5",
  "verification-report": "F702-6",
  "change-request": "F702-7",
  transfer: "F702-8",
};

export const FORM_TYPE_TO_PATH: Record<FormType, string> = {
  "F702-1": "plan",
  "F702-2": "input",
  "F702-3": "output",
  "F702-4": "review",
  "F702-5": "verification-plan",
  "F702-6": "verification-report",
  "F702-7": "change-request",
  "F702-8": "transfer",
};

export type FieldKind =
  | "markdown"
  | "text"
  | "boolean"
  | "linked"
  | "linked-single"
  | "linked-doc"
  | "linked-static";

export interface FieldConfig {
  key: string;
  label: string;
  kind: FieldKind;
  linkedCollection?: "standards" | "components" | "vendors" | "users";
}

export const FORM_FIELD_CONFIGS: Record<FormType, FieldConfig[]> = {
  "F702-1": [
    { key: "purposeAndRequirements", label: "① 기능/성능/사용적합성/안전 요구사항", kind: "markdown" },
    { key: "schedule", label: "② 설계 및 개발 일정 프로그램", kind: "markdown" },
    { key: "roles", label: "③ 업무분장 및 책임과 권한", kind: "markdown" },
    { key: "workBreakdown", label: "④ 업무 명세 구조도", kind: "markdown" },
    { key: "stageReviews", label: "⑤ 단계별 검토사항", kind: "markdown" },
    { key: "resources", label: "⑥ 재원/인력/시설 등 자원", kind: "markdown" },
    { key: "regulatoryRequirements", label: "⑦ 적용 규제요구사항 및 품질계획/절차/규격 관리", kind: "markdown" },
    { key: "outputs", label: "⑧ 개발 과정별 출력물 종류", kind: "markdown" },
  ],
  "F702-2": [
    { key: "usageRequirements", label: "① 기능/성능/사용적합성/안전성 요구사항", kind: "markdown" },
    { key: "standardIds", label: "② 적용 규격 및 법적 요구사항", kind: "linked", linkedCollection: "standards" },
    { key: "customerRequirements", label: "③ 고객 사항 및 마케팅 요구사항", kind: "markdown" },
    { key: "priorDesignInfo", label: "④ 이전 유사 설계로부터 도출된 정보", kind: "markdown" },
    { key: "otherRequirements", label: "⑤ 기타 필수 요구사항", kind: "markdown" },
    { key: "riskManagementNote", label: "⑥ 위험관리 계획서 및 산정 결과", kind: "markdown" },
    { key: "contractTerms", label: "⑦ 외부 개발계약 조건", kind: "markdown" },
    { key: "technicalReferences", label: "⑧ 활용 가능한 기술자료", kind: "markdown" },
    { key: "changeCriteria", label: "⑨ 설계변경 기준 및 적부 판정 기준", kind: "markdown" },
  ],
  "F702-3": [
    { key: "componentIds", label: "(1) 부품/원자재 목록", kind: "linked", linkedCollection: "components" },
    { key: "drawingNote", label: "(2) 도면 설명", kind: "markdown" },
    { key: "materialSpec", label: "(3) 원자재/부품 사양 및 근거자료", kind: "markdown" },
    { key: "manufacturingProcess", label: "(4) 제조 공정", kind: "markdown" },
    { key: "productSpec", label: "(5) 제품 사양 및 근거자료", kind: "markdown" },
    { key: "verificationPlanSummary", label: "(6) 검증 계획 요약", kind: "markdown" },
  ],
  "F702-4": [
    { key: "meetingDate", label: "회의일자", kind: "text" },
    { key: "attendeeIds", label: "참석자", kind: "linked", linkedCollection: "users" },
    { key: "reviewedDocumentIds", label: "② 검토한 문서 목록", kind: "linked-doc" },
    { key: "reviewCriteria", label: "① 설계 및 개발검토의 기준", kind: "markdown" },
    { key: "complianceEvidence", label: "③ 요구사항 충족 증거", kind: "markdown" },
    { key: "decision", label: "④ 다음 단계 진행 여부", kind: "text" },
    { key: "revisions", label: "⑤ 수정한 내용", kind: "markdown" },
    { key: "revisionReason", label: "⑥ 수정 사유 및 제안사항", kind: "markdown" },
  ],
  "F702-5": [
    { key: "protocolPurpose", label: "② 프로토콜의 목적", kind: "markdown" },
    { key: "proceduresAndSpecs", label: "③ 수행되는 절차와 명세(spec)", kind: "markdown" },
    { key: "standardIds", label: "④ 적용 규격", kind: "linked", linkedCollection: "standards" },
    { key: "modelSelectionRationale", label: "⑤ 사용될 모델 선정 근거", kind: "markdown" },
    { key: "facilitiesAndEquipment", label: "⑥ 시설/장비/시험장비 설명", kind: "markdown" },
    { key: "performers", label: "⑦ 검증 활동 수행자 설명", kind: "markdown" },
    { key: "referencedDocuments", label: "⑧ 절차서/표준/스펙/기록에 대한 설명", kind: "markdown" },
    { key: "sampleSizeStatistics", label: "⑨ 샘플크기 등 통계적 검증 결과", kind: "markdown" },
    { key: "methods", label: "검증/유효성확인 방법", kind: "linked-static" },
  ],
  "F702-6": [
    { key: "resultsSummary", label: "검증/유효성확인 결과 요약", kind: "markdown" },
    { key: "complianceStatus", label: "고객요건/적용사양 부합 여부", kind: "text" },
    { key: "nonComplianceAction", label: "불부합 시 조치", kind: "markdown" },
    { key: "relatedChangeRequestIds", label: "관련 F702-7 설계변경요청서", kind: "linked-doc" },
  ],
  "F702-7": [
    { key: "changeDescription", label: "12.1 변경 사항 및 사유", kind: "markdown" },
    { key: "importance", label: "12.2 중요성 판단", kind: "text" },
    { key: "scope", label: "12.2 변경 범위", kind: "markdown" },
    { key: "impactAssessment", label: "12.5 영향평가", kind: "markdown" },
    { key: "reReviewRequired", label: "12.3 재검토/재검증/재유효성확인 필요", kind: "boolean" },
  ],
  "F702-8": [
    { key: "transferMethod", label: "11.1 이관 방법", kind: "text" },
    { key: "transferredItems", label: "11.1(2) 이관 대상 정보", kind: "linked-static" },
    { key: "receiverVendorId", label: "외주 생산업체", kind: "linked-single", linkedCollection: "vendors" },
    { key: "receiverName", label: "이관받는 자", kind: "text" },
    { key: "receivedDate", label: "이관일자", kind: "text" },
    { key: "postMarketUpdateNote", label: "11.2 판매 후 정보 반영", kind: "markdown" },
  ],
};
