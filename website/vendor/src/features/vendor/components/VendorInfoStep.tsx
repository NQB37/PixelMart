import { MapPin, Phone, Store, User } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FieldError, ImageDropzone, Input, Label } from "@website/shared/ui";
import type { RegisterVendorInput } from "../schemas/vendor.schema";

interface VendorInfoStepProps {
  register: UseFormRegister<RegisterVendorInput>;
  errors: FieldErrors<RegisterVendorInput>;
  logoFile: File | null;
  onLogoChange: (file: File | null) => void;
}

export default function VendorInfoStep({
  register,
  errors,
  logoFile,
  onLogoChange,
}: VendorInfoStepProps) {
  return (
    <div className="space-y-4">
      <ImageDropzone
        label="Vendor logo (optional)"
        file={logoFile}
        onChange={onLogoChange}
        hint="PNG or JPG, square image works best"
      />

      <div className="space-y-1.5">
        <Label htmlFor="vendor-name">Vendor name</Label>
        <div className="relative">
          <Store
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            id="vendor-name"
            className="pl-9"
            aria-invalid={!!errors.vendorName}
            {...register("vendorName")}
          />
        </div>
        <FieldError>{errors.vendorName?.message}</FieldError>
      </div>

      <div className="pt-2">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4" strokeWidth={1.5} /> Pickup address
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vendor-recipient-name">Recipient name</Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                id="vendor-recipient-name"
                className="pl-9"
                aria-invalid={!!errors.recipientName}
                {...register("recipientName")}
              />
            </div>
            <FieldError>{errors.recipientName?.message}</FieldError>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-phone">Phone number</Label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                id="vendor-phone"
                className="pl-9"
                placeholder="0xxxxxxxxx"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </div>
            <FieldError>{errors.phone?.message}</FieldError>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-street">Street address</Label>
            <Input
              id="vendor-street"
              aria-invalid={!!errors.street}
              {...register("street")}
            />
            <FieldError>{errors.street?.message}</FieldError>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="vendor-ward">Ward</Label>
              <Input
                id="vendor-ward"
                aria-invalid={!!errors.ward}
                {...register("ward")}
              />
              <FieldError>{errors.ward?.message}</FieldError>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vendor-province">Province/City</Label>
              <Input
                id="vendor-province"
                aria-invalid={!!errors.province}
                {...register("province")}
              />
              <FieldError>{errors.province?.message}</FieldError>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
