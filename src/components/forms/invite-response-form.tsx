"use client";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { respondToInviteAction } from "@/modules/work-shift-slots/work-shift-slots-actions";

dayjs.extend(utc);

interface InviteResponseFormProps {
  token: string;
  status: string;
  expiresAt: string;
  deliverymanName: string;
  clientName: string;
  clientAddress: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
}

function InviteResponseForm({
  token,
  status,
  expiresAt,
  deliverymanName,
  clientName,
  clientAddress,
  shiftDate,
  startTime,
  endTime,
}: InviteResponseFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [responded, setResponded] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [agreed, setAgreed] = useState(false);

  const isExpired = new Date(expiresAt) < new Date();
  const isAlreadyResponded = status !== "PENDING";

  const { execute, isExecuting } = useAction(respondToInviteAction, {
    onSuccess: ({ data }) => {
      if (data?.error) {
        setServerError(data.error);
        toast.error(data.error);
        return;
      }

      if (data?.success) {
        setResponded(lastResponse);
        toast.success(lastResponse === "ACCEPTED" ? "Convite aceito com sucesso!" : "Convite recusado.");
      }
    },
    onError: () => {
      setServerError("Ocorreu um erro inesperado.");
    },
  });

  const [lastResponse, setLastResponse] = useState<"ACCEPTED" | "REJECTED">("ACCEPTED");

  function handleResponse(response: "ACCEPTED" | "REJECTED") {
    setServerError(null);
    setLastResponse(response);
    execute({ token, response });
  }

  if (responded) {
    return (
      <Card>
        <CardContent>
          <Text className="text-center" variant="muted">
            {responded === "ACCEPTED"
              ? "Você aceitou a prestação de serviço. Obrigado!"
              : "Você recusou a prestação de serviço."}
          </Text>
        </CardContent>
      </Card>
    );
  }

  if (isAlreadyResponded) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Este convite não é mais válido pois já foi respondido.</AlertDescription>
      </Alert>
    );
  }

  if (isExpired) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Este convite expirou e não pode mais ser respondido.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Prestação de Serviço</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex justify-between">
            <Text variant="muted">Prestador</Text>
            <Text variant="small">{deliverymanName}</Text>
          </div>
          <div className="flex justify-between">
            <Text variant="muted">Cliente</Text>
            <Text variant="small">{clientName}</Text>
          </div>
          <div className="flex justify-between">
            <Text variant="muted">Local</Text>
            <Text variant="small" className="text-right max-w-[60%]">
              {clientAddress}
            </Text>
          </div>
          <div className="flex justify-between">
            <Text variant="muted">Data</Text>
            <Text variant="small">{dayjs.utc(shiftDate).format("DD/MM/YYYY")}</Text>
          </div>
          <div className="flex justify-between">
            <Text variant="muted">Horário</Text>
            <Text variant="small">
              {dayjs(startTime).format("HH:mm")} - {dayjs(endTime).format("HH:mm")}
            </Text>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2">
        <Checkbox id="agreement" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
        <label htmlFor="agreement" className="text-xs text-muted-foreground leading-tight cursor-pointer">
          Declaro que estou ciente das condições da prestação de serviço e que minha participação é voluntária, sem
          vínculo empregatício.
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant="outline"
          disabled={isExecuting}
          isLoading={isExecuting && lastResponse === "REJECTED"}
          onClick={() => handleResponse("REJECTED")}
        >
          Recusar
        </Button>
        <Button
          className="flex-1"
          disabled={!agreed || isExecuting}
          isLoading={isExecuting && lastResponse === "ACCEPTED"}
          onClick={() => handleResponse("ACCEPTED")}
        >
          Aceitar
        </Button>
      </div>
    </div>
  );
}

export { InviteResponseForm };
