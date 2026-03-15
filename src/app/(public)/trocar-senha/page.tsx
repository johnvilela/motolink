import { redirect } from "next/navigation";
import { NewPasswordForm } from "@/components/forms/new-password-form";
import { Text } from "@/components/ui/text";

interface TrocarSenhaPageProps {
  searchParams: Promise<{ token?: string; userId?: string }>;
}

export default async function TrocarSenhaPage({ searchParams }: TrocarSenhaPageProps) {
  const { token, userId } = await searchParams;

  if (!token || !userId) {
    redirect("/login");
  }

  return (
    <main>
      <Text className="text-center mb-4" variant="muted">
        Crie sua senha para acessar o Sistema Motolink. A senha deve ter no mínimo 8 caracteres, incluindo letra
        maiúscula, minúscula, número e caractere especial.
      </Text>
      <NewPasswordForm token={token} userId={userId} />
    </main>
  );
}
