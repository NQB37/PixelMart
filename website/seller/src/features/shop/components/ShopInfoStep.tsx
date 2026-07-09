import { MapPin, Phone, Store, User } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { ImageDropzone, TextField } from "@website/shared/ui";
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
      <ImageDropzone
        label="Shop logo (optional)"
        file={logoFile}
        onChange={onLogoChange}
        hint="PNG or JPG, square image works best"
      />

      <TextField
        label="Shop name"
        icon={Store}
        error={errors.shopName?.message}
        {...register("shopName")}
      />

      <div className="pt-2">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4" strokeWidth={1.5} /> Pickup address
        </p>
        <div className="space-y-4">
          <TextField
            label="Recipient name"
            icon={User}
            error={errors.recipientName?.message}
            {...register("recipientName")}
          />
          <TextField
            label="Phone number"
            icon={Phone}
            placeholder="0xxxxxxxxx"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextField
            label="Street address"
            error={errors.street?.message}
            {...register("street")}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Ward" error={errors.ward?.message} {...register("ward")} />
            <TextField
              label="Province/City"
              error={errors.province?.message}
              {...register("province")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
