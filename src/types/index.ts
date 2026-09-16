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
