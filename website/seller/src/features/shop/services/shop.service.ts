import { api } from "@/lib/api";
import type { CreateShopInput } from "../schemas/shop.schema";

export interface Shop {
  id: string;
  shopName: string;
  logoUrl: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export const shopApi = {
  register: async (data: CreateShopInput): Promise<Shop> => {
    const payload = {
      shopName: data.shopName,
      ...(data.logoUrl ? { logoUrl: data.logoUrl } : {}),
    };
    const response = await api.post<Shop>("shops", payload);
    return response.data;
  },
};
