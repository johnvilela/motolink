"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@/hooks/use-mutation";
import { authClient } from "@/lib/services/auth-client";

export default function dashboardPage() {
  const router = useRouter();
  const { mutate: logout, status } = useMutation(async () => {
    const res = await authClient.signOut();

    if (res.data?.success) {
      router.push("/");
    }
  });

  return (
    <div>
      <button type="button" onClick={logout}>
        {status === "loading" ? "Saindo..." : "Sair"}
      </button>
    </div>
  );
}
