"use client";

import dayjs from "dayjs";
import { CheckIcon, UtensilsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { type PlanningPeriod, PlanningPeriodOptions } from "@/constants/planning-period";
import { cn } from "@/lib/cn";
import { upsertPlanningAction } from "@/modules/planning/planning-actions";
import { getCurrentDateKeyInSaoPaulo } from "@/utils/date-time";

interface PlanningClientCardProps {
  client: {
    id: string;
    name: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    uf: string;
    observations: string;
    provideMeal: boolean;
  };
  weekStart: string;
  weekDays: string[];
  dayLabels: string[];
  planningByDate: Record<string, Partial<Record<PlanningPeriod, number>>>;
}

export function PlanningClientCard({ client, weekDays, dayLabels, planningByDate }: PlanningClientCardProps) {
  const today = getCurrentDateKeyInSaoPaulo();
  const address = `${client.street}, ${client.number} - ${client.neighborhood}, ${client.city}/${client.uf}`;

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle>{client.name}</CardTitle>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{address}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {client.provideMeal && (
              <Badge variant="secondary" className="gap-1">
                <UtensilsIcon className="size-3" />
                Refeição
              </Badge>
            )}
          </div>
        </div>
        {client.observations && <p className="mt-1 text-xs text-muted-foreground italic">{client.observations}</p>}
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="flex shrink-0 flex-col gap-y-1.5">
            <div className="rounded-md p-2 text-center">
              <div className="text-xs font-medium">&nbsp;</div>
              <div className="text-xs text-muted-foreground">&nbsp;</div>
            </div>
            {PlanningPeriodOptions.map((periodOption) => (
              <div key={periodOption.value} className="flex items-center pr-2 text-xs text-muted-foreground">
                {periodOption.label}
              </div>
            ))}
          </div>
          {weekDays.map((dateStr, i) => {
            const isToday = dateStr === today;
            return (
              <div
                key={dateStr}
                className={cn(
                  "flex flex-1 flex-col gap-y-1.5 p-2 rounded-md",
                  dateStr < today && "opacity-40",
                  isToday && "bg-primary/10 ring-1 ring-primary/20",
                )}
              >
                <div className={cn("rounded-md p-2 text-center")}>
                  <div className="text-xs font-medium">{dayLabels[i]}</div>
                  <div className="text-xs text-muted-foreground">{dayjs(dateStr).format("DD/MM")}</div>
                </div>
                {PlanningPeriodOptions.map((periodOption) => (
                  <PlanningCell
                    key={periodOption.value}
                    clientId={client.id}
                    dateStr={dateStr}
                    period={periodOption.value}
                    value={planningByDate[dateStr]?.[periodOption.value] ?? 0}
                    disabled={dateStr < today}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface PlanningCellProps {
  clientId: string;
  dateStr: string;
  period: PlanningPeriod;
  value: number;
  disabled: boolean;
}

function PlanningCell({ clientId, dateStr, period, value, disabled }: PlanningCellProps) {
  const router = useRouter();
  const { executeAsync, isExecuting } = useAction(upsertPlanningAction);
  const [showCheck, setShowCheck] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const inputId = `planning-${clientId}-${dateStr}-${period}`;

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleBlur = useCallback(async () => {
    const newCount = Number.parseInt(inputValue, 10);

    if (Number.isNaN(newCount) || newCount < 0) {
      setInputValue(value.toString());
      return;
    }

    if (newCount === value) return;

    const actionResult = await executeAsync({
      clientId,
      plannedDate: dateStr,
      plannedCount: newCount,
      period,
    });

    if (actionResult?.data?.error) {
      setInputValue(value.toString());
      toast.error(actionResult.data.error);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowCheck(true);
      timerRef.current = setTimeout(() => setShowCheck(false), 2000);
      router.refresh();
    }
  }, [clientId, dateStr, executeAsync, inputValue, period, router, value]);

  return (
    <div className="relative w-full">
      <Input
        id={inputId}
        type="number"
        min={0}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          "h-8 text-center text-sm [&::-webkit-inner-spin-button]:appearance-none",
          isExecuting && "border-primary",
        )}
      />
      {(isExecuting || showCheck) && (
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          {isExecuting ? <Spinner className="size-3" /> : <CheckIcon className="size-3 text-green-500" />}
        </div>
      )}
    </div>
  );
}
