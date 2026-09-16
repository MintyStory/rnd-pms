export type UserRole =
  | "CEO"
  | "개발팀장"
  | "품질책임자"
  | "영업부"
  | "개발팀"
  | "생산팀"
  | "품질관리팀";

export const USER_ROLES: UserRole[] = [
  "CEO",
  "개발팀장",
  "품질책임자",
  "영업부",
  "개발팀",
  "생산팀",
  "품질관리팀",
];

export interface AppUser {
  id: string;
  name: string;
  email: string;
  dept?: string;
  role?: UserRole;
}

export type ProjectType =
  | "신규개발"
  | "중대한변경"
  | "사소한변경"
  | "모델추가"
  | "기술적변경";

export const PROJECT_TYPES: ProjectType[] = [
  "신규개발",
  "중대한변경",
  "사소한변경",
  "모델추가",
  "기술적변경",
];

export interface Product {
  id: string;
  name: string;
  category?: string;
  spec?: string;
}

export interface Standard {
  id: string;
  code: string;
  title: string;
  region?: string;
  note?: string;
}

export type VendorType = "외주생산" | "외주시험" | "자문";

export const VENDOR_TYPES: VendorType[] = ["외주생산", "외주시험", "자문"];

export interface Vendor {
  id: string;
  name: string;
  type?: VendorType;
  contact?: string;
}

export interface Component {
  id: string;
  name: string;
  spec?: string;
  unit?: string;
  note?: string;
}

export type ProjectStatus =
  | "타당성검토"
  | "개발계획"
  | "입력"
  | "출력"
  | "검토"
  | "검증"
  | "유효성확인"
  | "이관"
  | "완료";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "타당성검토",
  "개발계획",
  "입력",
  "출력",
  "검토",
  "검증",
  "유효성확인",
  "이관",
  "완료",
];

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  productId?: string;
  teamLeadId?: string;
  status: ProjectStatus;
  startDate?: string;
  targetDate?: string;
}

export type DocumentStatus = "draft" | "in_review" | "approved" | "obsolete";

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: "초안",
  in_review: "검토중",
  approved: "승인",
  obsolete: "폐기(개정)",
};

export interface RevisionEntry {
  rev: number;
  date: string;
  dcoNo?: string;
  reason?: string;
  author?: string;
  reviewer?: string;
  approver?: string;
}

export type FormType = "F702-1" | "F702-2" | "F702-3" | "F702-4";

export const FORM_TYPE_LABEL: Record<FormType, string> = {
  "F702-1": "개발 계획서",
  "F702-2": "개발 입력서",
  "F702-3": "개발 출력서",
  "F702-4": "설계검토회의록",
};

// 5.2.1(2) 개발 계획서(F702-1)가 최소한 반영해야 하는 항목
export interface F702_1_Content {
  purposeAndRequirements: string; // ① 기능/성능/사용적합성/안전 요구사항
  schedule: string; // ② 설계 및 개발 일정 프로그램
  roles: string; // ③ 업무분장 및 책임과 권한
  workBreakdown: string; // ④ 업무 명세 구조도
  stageReviews: string; // ⑤ 단계별 검토사항
  resources: string; // ⑥ 재원/인력/시설 등 자원
  regulatoryRequirements: string; // ⑦ 적용 규제요구사항 및 품질계획/절차/규격 관리
  outputs: string; // ⑧ 개발 과정별 출력물 종류
}

// 6.3(2) 개발 입력서(F702-2)가 최소한 반영해야 하는 항목
export interface F702_2_Content {
  usageRequirements: string; // ① 기능/성능/사용적합성/안전성 요구사항
  standardIds: string[]; // ② 적용 규격 및 법적 요구사항 (standards 마스터 참조)
  customerRequirements: string; // ③ 고객 사항 및 마케팅 요구사항
  priorDesignInfo: string; // ④ 이전 유사 설계로부터 도출된 정보
  otherRequirements: string; // ⑤ 기타 필수 요구사항
  riskManagementNote: string; // ⑥ 위험관리 계획서 및 산정 결과 (OP-711 연계, 요약/링크)
  contractTerms: string; // ⑦ 외부 개발계약 조건
  technicalReferences: string; // ⑧ 활용 가능한 기술자료
  changeCriteria: string; // ⑨ 설계변경 기준 및 적부 판정 기준
}

// 7.2.1 개발 출력서(F702-3)가 필수 포함해야 하는 문서
export interface F702_3_Content {
  componentIds: string[]; // (1) 부품/원자재 목록 (components 마스터 참조)
  drawingNote: string; // (2) 도면 (첨부파일은 attachments 참조)
  materialSpec: string; // (3) 원자재/부품 사양 및 근거자료
  manufacturingProcess: string; // (4) 제조 공정
  productSpec: string; // (5) 제품 사양 및 근거자료
  verificationPlanSummary: string; // (6) 검증 계획 요약
}

export interface Attachment {
  name: string;
  storagePath: string;
  url: string;
  uploadedAt: string;
}

export type ReviewDecision = "진행" | "보류" | "반려";

export const REVIEW_DECISIONS: ReviewDecision[] = ["진행", "보류", "반려"];

// 8.2 설계검토회의록(F702-4)이 포함해야 하는 사항
export interface F702_4_Content {
  meetingDate: string;
  attendeeIds: string[]; // 참석자 (users 마스터 참조)
  reviewedDocumentIds: string[]; // ② 검토한 문서 목록 (해당 프로젝트의 documents 참조)
  reviewCriteria: string; // ① 설계 및 개발검토의 기준
  complianceEvidence: string; // ③ 요구사항 충족 증거
  decision: ReviewDecision; // ④ 다음 단계 진행 여부
  revisions: string; // ⑤ 수정한 내용
  revisionReason: string; // ⑥ 수정 사유 및 제안사항
}

export type DocumentContent =
  | F702_1_Content
  | F702_2_Content
  | F702_3_Content
  | F702_4_Content;

export interface DocumentRecord<TContent = DocumentContent> {
  id: string;
  projectId: string;
  formType: FormType;
  status: DocumentStatus;
  reviewerName?: string;
  approverName?: string;
  revisionHistory: RevisionEntry[];
  attachments?: Attachment[];
  content: TContent;
}
