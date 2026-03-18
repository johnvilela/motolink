"use client";

import { CalendarDays, CheckCircle2, Clock, MapPin, User, XCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";
import { respondToInviteAction } from "@/modules/work-shift-slots/work-shift-slots-actions";
import { formatDbDate } from "@/utils/date-time";
import { formatWorkShiftCheckTime } from "@/utils/format-work-shift-check-time";

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

function DetailRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-b-0">
      <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex flex-1 justify-between gap-2 min-w-0">
        <Text variant="muted" className="shrink-0">
          {label}
        </Text>
        <Text variant="small" className={cn("text-right", className)}>
          {value}
        </Text>
      </div>
    </div>
  );
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
        <CardContent className="flex flex-col items-center gap-3 py-2">
          {responded === "ACCEPTED" ? (
            <CheckCircle2 className="size-10 text-emerald-500" />
          ) : (
            <XCircle className="size-10 text-muted-foreground" />
          )}
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
        <CardContent className="flex flex-col">
          <DetailRow icon={User} label="Prestador" value={deliverymanName} />
          <DetailRow icon={User} label="Cliente" value={clientName} />
          <DetailRow icon={MapPin} label="Local" value={clientAddress} className="max-w-[60%]" />
          <DetailRow icon={CalendarDays} label="Data" value={formatDbDate(shiftDate, "--/--/----")} />
          <DetailRow
            icon={Clock}
            label="Horário"
            value={`${formatWorkShiftCheckTime(startTime, "--:--")} - ${formatWorkShiftCheckTime(endTime, "--:--")}`}
          />
        </CardContent>
      </Card>

      {/* Agreement — large tappable area */}
      <button
        type="button"
        onClick={() => setAgreed((prev) => !prev)}
        className={cn(
          "flex items-start gap-3 rounded-xl p-4 text-left transition-all",
          "border-2 ring-0 outline-none",
          agreed
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-dashed border-muted-foreground/30 bg-muted/40 hover:border-muted-foreground/50",
        )}
      >
        <Checkbox
          id="agreement"
          checked={agreed}
          onCheckedChange={(checked) => setAgreed(checked === true)}
          tabIndex={-1}
          className="mt-0.5 size-5 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        />
        <span
          className={cn("text-sm leading-snug transition-colors", agreed ? "text-foreground" : "text-muted-foreground")}
        >
          Declaro que estou ciente das condições da prestação de serviço e que minha participação é voluntária, sem
          vínculo empregatício.
        </span>
      </button>

      <div className="flex gap-3">
        <Button
          className="flex-1 h-11"
          variant="outline"
          disabled={isExecuting}
          isLoading={isExecuting && lastResponse === "REJECTED"}
          onClick={() => handleResponse("REJECTED")}
        >
          Recusar
        </Button>
        <Button
          className="flex-1 h-11"
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
