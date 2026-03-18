"use client";

import { MoonIcon, PlusIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import { WorkShiftSlotForm } from "@/components/forms/work-shift-slot-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { type PlanningPeriod, planningPeriodConst } from "@/constants/planning-period";

type FormClient = Parameters<typeof WorkShiftSlotForm>[0]["client"];

interface MonitoringPlanningRowProps {
  periodLabel: string;
  period: PlanningPeriod;
  client: FormClient;
  shiftDate: string;
  onRefresh?: () => void;
}

export function MonitoringPlanningRow({
  periodLabel,
  period,
  client,
  shiftDate,
  onRefresh,
}: MonitoringPlanningRowProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between rounded-md border-l-4 border-l-yellow-400 bg-gradient-to-r from-amber-50 via-yellow-50/90 to-white px-4 py-3 dark:border-yellow-900/60 dark:from-yellow-950/35 dark:via-amber-950/20 dark:to-background">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-amber-800 dark:text-yellow-200">Vago</p>
          <p className="inline-flex items-center gap-1 text-xs text-amber-700/80 dark:text-yellow-200/75">
            {period === planningPeriodConst.DAYTIME ? <SunIcon className="size-3" /> : <MoonIcon className="size-3" />}
            {periodLabel}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-yellow-200 bg-white/90 text-amber-800 shadow-sm hover:bg-yellow-100 hover:text-amber-900 dark:border-yellow-900/70 dark:bg-yellow-950/20 dark:text-yellow-100 dark:hover:bg-yellow-950/40"
          onClick={() => setSheetOpen(true)}
        >
          <PlusIcon className="mr-1 size-3.5" />
          Adicionar entregador
        </Button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-[30vw]">
          <SheetHeader>
            <SheetTitle>Adicionar entregador</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <WorkShiftSlotForm
              client={client}
              shiftDate={shiftDate}
              defaultPeriod={period}
              onSuccess={() => {
                setSheetOpen(false);
                onRefresh?.();
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
