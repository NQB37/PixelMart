import { CalendarClock, CreditCard, Landmark, User } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { FieldError, ImageDropzone, Input, Label } from "@website/shared/ui";
import type { RegisterVendorInput } from "../schemas/vendor.schema";

interface IdentityBankStepProps {
  register: UseFormRegister<RegisterVendorInput>;
  errors: FieldErrors<RegisterVendorInput>;
  idFrontFile: File | null;
  idBackFile: File | null;
  onIdFrontChange: (file: File | null) => void;
  onIdBackChange: (file: File | null) => void;
  idPhotosError?: string;
}

export default function IdentityBankStep({
  register,
  errors,
  idFrontFile,
  idBackFile,
  onIdFrontChange,
  onIdBackChange,
  idPhotosError,
}: IdentityBankStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          National ID (CCCD/CMND)
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="vendor-national-id">ID number</Label>
          <div className="relative">
            <CreditCard
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <Input
              id="vendor-national-id"
              className="pl-9"
              aria-invalid={!!errors.nationalId}
              {...register("nationalId")}
            />
          </div>
          <FieldError>{errors.nationalId?.message}</FieldError>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ImageDropzone label="Front side" file={idFrontFile} onChange={onIdFrontChange} />
          <ImageDropzone label="Back side" file={idBackFile} onChange={onIdBackChange} />
        </div>
        {idPhotosError && (
          <p className="mt-1.5 text-sm font-medium text-destructive">{idPhotosError}</p>
        )}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Bank account</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vendor-bank-account">Account number</Label>
            <div className="relative">
              <Landmark
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                id="vendor-bank-account"
                className="pl-9"
                aria-invalid={!!errors.bankAccountNumber}
                {...register("bankAccountNumber")}
              />
            </div>
            <FieldError>{errors.bankAccountNumber?.message}</FieldError>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-card-holder">Cardholder name</Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                id="vendor-card-holder"
                className="pl-9"
                placeholder="AS PRINTED ON CARD"
                aria-invalid={!!errors.cardHolderName}
                {...register("cardHolderName")}
              />
            </div>
            <FieldError>{errors.cardHolderName?.message}</FieldError>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vendor-card-expiry">Expiry date</Label>
            <div className="relative">
              <CalendarClock
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <Input
                id="vendor-card-expiry"
                className="pl-9"
                placeholder="MM/YY"
                aria-invalid={!!errors.cardExpiry}
                {...register("cardExpiry")}
              />
            </div>
            <FieldError>{errors.cardExpiry?.message}</FieldError>
          </div>
        </div>
      </div>
    </div>
  );
}
