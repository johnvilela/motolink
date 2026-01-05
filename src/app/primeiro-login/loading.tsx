import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function LoadingFirstLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Heading>Carregando...</Heading>
      <Text>
        Por favor, aguarde enquanto preparamos sua primeira experiência.
      </Text>
    </div>
  );
}
