import { LoginForm } from "@/components/forms/login-form";
import { Text } from "@/components/ui/text";

export default function LoginPage() {
  return (
    <>
      <Text className="text-center" variant="muted">
        Bem-vindo ao Sistema Motolink. Faça login para acessar o painel de
        controle e gerenciar suas operações de forma simples e eficiente.
      </Text>
      <LoginForm />
    </>
  );
}
