import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "./Sidebar";

export default function SellerLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
