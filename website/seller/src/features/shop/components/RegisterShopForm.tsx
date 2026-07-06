import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Store, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRegisterShop } from "../hooks/useRegisterShop";
import { shopApi } from "../services/shop.service";
import {
  registerShopSchema,
  shopInfoFieldNames,
  type RegisterShopInput,
} from "../schemas/shop.schema";
import ShopInfoStep from "./ShopInfoStep";
import IdentityBankStep from "./IdentityBankStep";

const STEPS = ["Shop information", "Identity & bank", "Finish"] as const;
const NO_ERRORS = {};

function ProgressStepper({ currentIndex }: { currentIndex: number }) {
  // ponytail: each step gets an equal-width column so a centered dot lines
  // up with its centered label; the connecting track is a separate absolute
  // bar spanning column-center to column-center (dot-center math, see below).
  const colWidth = 100 / STEPS.length;
  return (
    <div className="relative mb-8">
      <div
        className="absolute top-1.5 h-0.5 -translate-y-1/2 bg-slate-200"
        style={{
          left: `${colWidth / 2}%`,
          width: `${colWidth * (STEPS.length - 1)}%`,
        }}
      />
      <div
        className="absolute top-1.5 h-0.5 -translate-y-1/2 bg-indigo-600 transition-all"
        style={{
          left: `${colWidth / 2}%`,
          width: `${colWidth * currentIndex}%`,
        }}
      />
      <div className="flex">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={`h-3 w-3 shrink-0 rounded-full ${
                i <= currentIndex ? "bg-indigo-600" : "bg-slate-300"
              } ${i === currentIndex ? "ring-4 ring-indigo-100" : ""}`}
            />
            <span
              className={`text-xs font-medium ${i <= currentIndex ? "text-slate-900" : "text-slate-400"}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Register your shop
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500">
            Tell us about your shop to start selling on PixelMart
          </p>
        </div>

        <ProgressStepper currentIndex={step - 1} />

        {(error || uploadError) && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError || error?.message}</span>
          </div>
        )}

        {step === 3 ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Registration submitted
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your shop is pending review. We&apos;ll notify you once our team
              approves it.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/", replace: true })}
              className="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full rounded-lg border border-slate-300 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Back
                </button>
              )}
              {step === 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  onClick={() => setStep2Attempted(true)}
                  className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isUploading
                    ? "Uploading..."
                    : isPending
                      ? "Registering..."
                      : "Complete registration"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
