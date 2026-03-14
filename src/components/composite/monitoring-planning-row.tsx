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
}

export function MonitoringPlanningRow({ periodLabel, period, client, shiftDate }: MonitoringPlanningRowProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between rounded-md border-l-4 border-l-yellow-400 bg-muted/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Vago</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {period === planningPeriodConst.DAYTIME ? <SunIcon className="size-3" /> : <MoonIcon className="size-3" />}
            {periodLabel}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
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
              onSuccess={() => setSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
