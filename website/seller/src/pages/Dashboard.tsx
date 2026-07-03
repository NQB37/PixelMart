import { useLogout } from "@/features/auth/hooks/useLogout";

export default function Dashboard() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            Seller Dashboard
          </h1>
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            {isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Welcome to your PixelMart shop management portal.
        </p>
      </div>
    </div>
  );
}
