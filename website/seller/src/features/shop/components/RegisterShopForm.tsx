import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useRegisterShop } from "../hooks/useRegisterShop";
import { createShopSchema, type CreateShopInput } from "../schemas/shop.schema";

export default function RegisterShopForm() {
  const { mutate: registerShop, isPending, error } = useRegisterShop();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateShopInput>({
    resolver: zodResolver(createShopSchema),
  });

  const onSubmit = (data: CreateShopInput) => {
    registerShop(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
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

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="shopName"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Shop name
            </label>
            <div className="relative">
              <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="shopName"
                type="text"
                {...register("shopName")}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            {errors.shopName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.shopName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="logoUrl"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Logo URL (optional)
            </label>
            <div className="relative">
              <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="logoUrl"
                type="text"
                placeholder="https://..."
                {...register("logoUrl")}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            {errors.logoUrl && (
              <p className="mt-1 text-xs text-red-500">
                {errors.logoUrl.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "Registering..." : "Register shop"}
          </button>
        </form>
      </div>
    </div>
  );
}
