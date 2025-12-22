"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/services/auth-client";

export default function DashboardPage() {
  const router = useRouter();

  async function logout() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  }

  return (
    <main className="p-8">
      <div className="mx-auto max-w-lg w-full grid grid-cols-3 gap-4">
        <h1>Dashboard</h1>
      </div>
      <Button onClick={() => logout()}>Logout</Button>
    </main>
  );
}
