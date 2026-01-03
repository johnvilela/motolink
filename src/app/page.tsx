import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/forms/auth-form";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function HomePage() {
  return (
    <main className="bg-background flex items-stretch h-screen overflow-hidden">
      <div className="flex flex-col justify-center items-center w-full lg:max-w-2xl overflow-y-auto bg-light-background">
        <div className="max-w-sm mx-auto w-full p-4">
          <Link href="/login">
            <Image
              src="/motolink.png"
              width={256}
              height={75}
              alt="Logo da Motolink"
              className="mx-auto mb-12"
            />
          </Link>
          <div className="text-center">
            <Heading variant="h2">Bem-vindo de volta!</Heading>
            <Text>Entre seu email para acessar sua conta</Text>
          </div>

          <AuthForm />
        </div>
      </div>

      <div className="flex-1 relative hidden lg:block">
        <Image
          className="object-cover"
          src="/rio-de-janeiro.jpg"
          alt="Campo de Hóquei sobre grama"
          fill
        />
      </div>
    </main>
  );
}
