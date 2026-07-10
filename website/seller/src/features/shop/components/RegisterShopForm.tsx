import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, PixelButton } from "@website/shared/ui";
import AuthShell from "@/features/auth/components/AuthShell";
import { useRegisterShop } from "../hooks/useRegisterShop";
import { shopApi } from "../services/shop.service";
import {
  registerShopSchema,
  shopInfoFieldNames,
  type RegisterShopInput,
} from "../schemas/shop.schema";
import ShopInfoStep from "./ShopInfoStep";
import IdentityBankStep from "./IdentityBankStep";

const STEPS = [
  { label: "Shop information", description: "Name, pickup address, contact" },
  {
    label: "Identity & bank",
    description: "ID verification and payout account",
  },
  { label: "Finish", description: "Review and submit" },
];
const NO_ERRORS = {};

export default function RegisterShopForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idPhotosError, setIdPhotosError] = useState<string>();
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  const navigate = useNavigate();
  const { mutate: registerShop, isPending, error } = useRegisterShop();
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterShopInput>({
    resolver: zodResolver(registerShopSchema),
  });

  const goNext = async () => {
    setStep1Attempted(true);
    const valid = await trigger(shopInfoFieldNames);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegisterShopInput) => {
    if (!idFrontFile || !idBackFile) {
      setIdPhotosError("Please upload both sides of your ID");
      return;
    }
    setIdPhotosError(undefined);
    setUploadError(undefined);
    setIsUploading(true);
    try {
      const [logoUrl, idFrontUrl, idBackUrl] = await Promise.all([
        logoFile
          ? shopApi.uploadImage(logoFile, "shops/logos")
          : Promise.resolve(undefined),
        shopApi.uploadImage(idFrontFile, "shops/identity"),
        shopApi.uploadImage(idBackFile, "shops/identity"),
      ]);
      registerShop(
        { ...data, logoUrl, idFrontUrl, idBackUrl },
        { onSuccess: () => setStep(3) },
      );
    } catch {
      setUploadError("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AuthShell
      heading='Register your shop'
      description='Tell us about your business to start selling on PixelMart.'
      steps={STEPS}
      currentStepIndex={step - 1}
    >
      {(error || uploadError) && (
        <Alert variant='destructive' className='mb-6'>
          <AlertDescription>{uploadError || error?.message}</AlertDescription>
        </Alert>
      )}

      {step === 3 ? (
        <div className='flex flex-col items-center py-4 text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success'>
            <CheckCircle2 className='h-8 w-8' strokeWidth={1.5} />
          </div>
          <h2 className='font-display text-lg font-bold text-foreground'>
            Registration submitted
          </h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Your shop is pending review. We&apos;ll notify you once our team
            approves it.
          </p>
          <PixelButton
            variant='cyan'
            className='mt-6 w-full'
            onClick={() => navigate({ to: "/", replace: true })}
          >
            Go to Dashboard
          </PixelButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <h2 className='font-display text-xl font-bold text-foreground'>
              {STEPS[step - 1].label}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {STEPS[step - 1].description}
            </p>
          </div>

          {/* Both steps stay mounted (just hidden) so react-hook-form never
              drops a step's values when the other step is shown. Errors are
              only shown for a step once the user has tried to leave it —
              react-hook-form re-validates every registered field (even ones
              on the other, hidden step) whenever this component re-renders,
              so an ungated `errors` would flash unrelated messages early. */}
          <div className={step === 1 ? "space-y-4" : "hidden"}>
            <ShopInfoStep
              register={register}
              errors={step1Attempted ? errors : NO_ERRORS}
              logoFile={logoFile}
              onLogoChange={setLogoFile}
            />
          </div>
          <div className={step === 2 ? "space-y-4" : "hidden"}>
            <IdentityBankStep
              register={register}
              errors={step2Attempted ? errors : NO_ERRORS}
              idFrontFile={idFrontFile}
              idBackFile={idBackFile}
              onIdFrontChange={setIdFrontFile}
              onIdBackChange={setIdBackFile}
              idPhotosError={idPhotosError}
            />
          </div>

          <div className='flex gap-3 pt-2'>
            {step === 2 && (
              <PixelButton
                type='button'
                variant='ghost'
                className='w-full border border-input'
                onClick={() => setStep(1)}
              >
                Back
              </PixelButton>
            )}
            {step === 1 ? (
              <PixelButton
                type='button'
                variant='cyan'
                className='w-full'
                onClick={goNext}
              >
                Continue
              </PixelButton>
            ) : (
              <PixelButton
                variant='cyan'
                className='w-full'
                disabled={isPending || isUploading}
                onClick={() => setStep2Attempted(true)}
              >
                {isUploading
                  ? "Uploading…"
                  : isPending
                    ? "Registering…"
                    : "Complete registration"}
              </PixelButton>
            )}
          </div>
        </form>
      )}
    </AuthShell>
  );
}
