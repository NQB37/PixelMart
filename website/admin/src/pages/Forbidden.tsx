import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <ShieldAlert className="h-10 w-10 text-red-500" />
      <h1 className="text-2xl font-semibold text-slate-900">
        Access denied
      </h1>
      <p className="text-sm text-slate-500">
        Your account does not have permission to access the admin panel.
      </p>
      <Link
        to="/login"
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Back to login
      </Link>
    </div>
  );
}
