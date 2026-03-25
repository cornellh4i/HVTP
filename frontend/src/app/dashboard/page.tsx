"use client";
import { useAuth } from "@/utils/AuthContext";
import { logOut } from "@/api/users";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    document.cookie = "session=; path=/; max-age=0";
    await logOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {user && <p className="text-gray-600 mt-2">Welcome, {user.email}</p>}
      <button
        onClick={handleSignOut}
        className="mt-4 w-fit rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}