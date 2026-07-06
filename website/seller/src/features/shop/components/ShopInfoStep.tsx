import { Store, MapPin, User, Phone } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import FormField from "./FormField";
import ImageUploadField from "./ImageUploadField";
import type { RegisterShopInput } from "../schemas/shop.schema";

interface ShopInfoStepProps {
  register: UseFormRegister<RegisterShopInput>;
  errors: FieldErrors<RegisterShopInput>;
  logoFile: File | null;
  onLogoChange: (file: File | null) => void;
}

export default function ShopInfoStep({
  register,
  errors,
  logoFile,
  onLogoChange,
}: ShopInfoStepProps) {
  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Shop logo (optional)"
        file={logoFile}
        onChange={onLogoChange}
        hint="PNG or JPG, square image works best"
      />

      <FormField
        id="shopName"
        label="Shop name"
        icon={Store}
        registration={register("shopName")}
        error={errors.shopName?.message}
      />

      <div className="pt-2">
        <p className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-700">
          <MapPin className="h-4 w-4" /> Pickup address
        </p>
        <div className="space-y-4">
          <FormField
            id="recipientName"
            label="Recipient name"
            icon={User}
            registration={register("recipientName")}
            error={errors.recipientName?.message}
          />
          <FormField
            id="phone"
            label="Phone number"
            icon={Phone}
            placeholder="0xxxxxxxxx"
            registration={register("phone")}
            error={errors.phone?.message}
          />
          <FormField
            id="street"
            label="Street address"
            registration={register("street")}
            error={errors.street?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="ward"
              label="Ward"
              registration={register("ward")}
              error={errors.ward?.message}
            />
            <FormField
              id="province"
              label="Province/City"
              registration={register("province")}
              error={errors.province?.message}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
