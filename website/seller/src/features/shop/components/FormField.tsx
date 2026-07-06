import type { LucideIcon } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  error?: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
}

export default function FormField({
  id,
  label,
  icon: Icon,
  error,
  type = "text",
  placeholder,
  registration,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...registration}
          className={`w-full rounded-lg border border-slate-300 py-2 ${Icon ? "pl-9" : "pl-3"} pr-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
