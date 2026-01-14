import { LogoutButton } from "@/components/auth/LogoutButton";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
    </div>
  );
}
