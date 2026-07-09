import { CalendarClock, CreditCard, Landmark, User } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { ImageDropzone, TextField } from "@website/shared/ui";
import type { RegisterShopInput } from "../schemas/shop.schema";

interface IdentityBankStepProps {
  register: UseFormRegister<RegisterShopInput>;
  errors: FieldErrors<RegisterShopInput>;
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
        <TextField
          label="ID number"
          icon={CreditCard}
          error={errors.nationalId?.message}
          {...register("nationalId")}
        />
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
          <TextField
            label="Account number"
            icon={Landmark}
            error={errors.bankAccountNumber?.message}
            {...register("bankAccountNumber")}
          />
          <TextField
            label="Cardholder name"
            icon={User}
            placeholder="AS PRINTED ON CARD"
            error={errors.cardHolderName?.message}
            {...register("cardHolderName")}
          />
          <TextField
            label="Expiry date"
            icon={CalendarClock}
            placeholder="MM/YY"
            error={errors.cardExpiry?.message}
            {...register("cardExpiry")}
          />
        </div>
      </div>
    </div>
  );
}
