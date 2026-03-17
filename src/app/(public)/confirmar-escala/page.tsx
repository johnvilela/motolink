import { redirect } from "next/navigation";
import { InviteResponseForm } from "@/components/forms/invite-response-form";
import { Text } from "@/components/ui/text";
import { workShiftSlotsService } from "@/modules/work-shift-slots/work-shift-slots-service";

interface ConfirmarEscalaPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ConfirmarEscalaPage({ searchParams }: ConfirmarEscalaPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login");
  }

  const result = await workShiftSlotsService().getInviteByToken(token);

  if (result.isErr()) {
    return (
      <main>
        <Text className="text-center" variant="muted">
          Convite não encontrado ou link inválido.
        </Text>
      </main>
    );
  }

  const invite = result.value;

  return (
    <main>
      <Text className="text-center mb-4" variant="muted">
        Confirmação de prestação de serviço
      </Text>
      <InviteResponseForm
        token={token}
        status={invite.status}
        expiresAt={invite.expiresAt.toISOString()}
        deliverymanName={invite.deliveryman.name}
        clientName={invite.clientName}
        clientAddress={invite.clientAddress}
        shiftDate={invite.shiftDate.toISOString()}
        startTime={invite.startTime.toISOString()}
        endTime={invite.endTime.toISOString()}
      />
    </main>
  );
}
