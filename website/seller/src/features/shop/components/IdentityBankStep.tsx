import { CreditCard, User, Landmark, CalendarClock } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import FormField from "./FormField";
import ImageUploadField from "./ImageUploadField";
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
        <p className="mb-2 text-sm font-medium text-slate-700">
          National ID (CCCD/CMND)
        </p>
        <FormField
          id="nationalId"
          label="ID number"
          icon={CreditCard}
          registration={register("nationalId")}
          error={errors.nationalId?.message}
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ImageUploadField
            label="Front side"
            file={idFrontFile}
            onChange={onIdFrontChange}
          />
          <ImageUploadField
            label="Back side"
            file={idBackFile}
            onChange={onIdBackChange}
          />
        </div>
        {idPhotosError && (
          <p className="mt-1 text-xs text-red-500">{idPhotosError}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Bank account
        </p>
        <div className="space-y-4">
          <FormField
            id="bankAccountNumber"
            label="Account number"
            icon={Landmark}
            registration={register("bankAccountNumber")}
            error={errors.bankAccountNumber?.message}
          />
          <FormField
            id="cardHolderName"
            label="Cardholder name"
            icon={User}
            placeholder="AS PRINTED ON CARD"
            registration={register("cardHolderName")}
            error={errors.cardHolderName?.message}
          />
          <FormField
            id="cardExpiry"
            label="Expiry date"
            icon={CalendarClock}
            placeholder="MM/YY"
            registration={register("cardExpiry")}
            error={errors.cardExpiry?.message}
          />
        </div>
      </div>
    </div>
  );
}
