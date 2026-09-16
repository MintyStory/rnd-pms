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

export interface DocumentRecord<TContent = F702_1_Content> {
  id: string;
  projectId: string;
  formType: "F702-1";
  status: DocumentStatus;
  reviewerName?: string;
  approverName?: string;
  revisionHistory: RevisionEntry[];
  content: TContent;
}
