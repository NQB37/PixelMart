import { api } from "@/lib/api";
import type { RegisterShopInput } from "../schemas/shop.schema";

export interface Shop {
  id: string;
  shopName: string;
  logoUrl: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export type RegisterShopPayload = RegisterShopInput & {
  logoUrl?: string;
  idFrontUrl: string;
  idBackUrl: string;
};

export const shopApi = {
  getMyShop: async (): Promise<Shop> => {
    // A brand-new seller has no shop yet — the server 404s, which is an
    // expected state here (not an error to surface as a toast).
    const response = await api.get<Shop>("shops/me", { skipErrorToast: true });
    return response.data;
  },
  register: async (data: RegisterShopPayload): Promise<Shop> => {
    const response = await api.post<Shop>("shops", data);
    return response.data;
  },
  uploadImage: async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const response = await api.post<{ url: string }>("uploads", formData);
    return response.data.url;
  },
};
