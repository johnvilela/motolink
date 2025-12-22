import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function HomePage() {
  return (
    <div className="flex items-stretch h-svh overflow-hidden">
      <div className="flex items-center justify-between w-full lg:max-w-2xl bg-light-background">
        <div className="max-w-sm mx-auto w-full p-4 ">
          <Link href="/login">
            <Image
              src="/motolink.png"
              width={200}
              height={128}
              alt="Logo da Motolink"
              className="mx-auto"
            />
          </Link>
          <div className="text-center mt-6">
            <Heading variant="h3">Bem vindo de volta</Heading>
            <Text>Entre seu email para acessar sua conta</Text>
          </div>
          <LoginForm />
        </div>
      </div>

      <div className="flex-1 relative hidden lg:block">
        <Image
          src="/rj.jpg"
          alt="Campo de Hóquei sobre grama"
          className="object-cover"
          loading="lazy"
          preload={false}
          fill
        />
      </div>
    </div>
  );
}
