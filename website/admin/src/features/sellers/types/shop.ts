export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ShopStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export interface AdminShop {
  id: string;
  shopName: string;
  logoUrl: string | null;
  rating: number;
  approvalStatus: ApprovalStatus;
  status: ShopStatus;
  rejectedReason: string | null;
  ownerEmail: string;
  ownerFullName: string | null;
  createdAt: string;
}

export interface ShopVerification {
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

export interface AdminShopDetail extends AdminShop {
  verification: ShopVerification | null;
}

export interface ListShopsParams {
  approvalStatus: ApprovalStatus;
  page: number;
  limit: number;
  search?: string;
}

export interface ListShopsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListShopsResponse {
  shops: AdminShop[];
  meta: ListShopsMeta;
}
