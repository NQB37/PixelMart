export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type VendorStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export interface AdminVendor {
  id: string;
  vendorName: string;
  logoUrl: string | null;
  rating: number;
  approvalStatus: ApprovalStatus;
  status: VendorStatus;
  rejectedReason: string | null;
  ownerEmail: string;
  ownerFullName: string | null;
  createdAt: string;
}

export interface VendorVerification {
  recipientName: string;
  phone: string;
  street: string;
  ward: string;
  province: string;
  nationalId: string;
  idFrontUrl: string;
  idBackUrl: string;
  bankAccountNumber: string;
  cardHolderName: string;
  cardExpiry: string;
}

export interface AdminVendorDetail extends AdminVendor {
  verification: VendorVerification | null;
}

export interface ListVendorsParams {
  approvalStatus: ApprovalStatus;
  page: number;
  limit: number;
  search?: string;
}

export interface ListVendorsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListVendorsResponse {
  vendors: AdminVendor[];
  meta: ListVendorsMeta;
}
