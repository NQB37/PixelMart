import { api } from "@/lib/api";
import type { RegisterVendorInput } from "../schemas/vendor.schema";

export interface Vendor {
  id: string;
  vendorName: string;
  logoUrl: string | null;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export type RegisterVendorPayload = RegisterVendorInput & {
  logoUrl?: string;
  idFrontUrl: string;
  idBackUrl: string;
};

export const vendorApi = {
  getMyVendor: async (): Promise<Vendor> => {
    // A brand-new vendor has no vendor yet — the server 404s, which is an
    // expected state here (not an error to surface as a toast).
    const response = await api.get<Vendor>("vendors/me", { skipErrorToast: true });
    return response.data;
  },
  register: async (data: RegisterVendorPayload): Promise<Vendor> => {
    const response = await api.post<Vendor>("vendors", data);
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
