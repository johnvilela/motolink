"use client";

import dayjs from "dayjs";
import { EllipsisVerticalIcon, EyeIcon, MoonIcon, SendIcon, SunIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { WorkShiftSlotForm } from "@/components/forms/work-shift-slot-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { ContractTypeOptions } from "@/constants/contract-type";
import { type PlanningPeriod, planningPeriodConst } from "@/constants/planning-period";
import {
  WORK_SHIFT_SLOT_STATUS_COLORS,
  WORK_SHIFT_SLOT_STATUS_LABELS,
  type WorkShiftSlotStatus,
  workShiftSlotStatusTransitions,
} from "@/constants/work-shift-slot-status";
import { cn } from "@/lib/cn";
import { updateWorkShiftSlotStatusAction } from "@/modules/work-shift-slots/work-shift-slots-actions";
import { formatMoneyDisplay } from "@/utils/masks/money-mask";

type FormClient = Parameters<typeof WorkShiftSlotForm>[0]["client"];

interface WorkShiftSlot {
  id: string;
  status: string;
  contractType: string;
  period: string[];
  startTime: string;
  endTime: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  deliverymenPaymentValue: string;
  deliveryman?: { id: string; name: string } | null;
}

interface MonitoringWorkShiftRowProps {
  slot: WorkShiftSlot;
  periodLabel: string;
  period: PlanningPeriod;
  client: FormClient;
  shiftDate: string;
}

export function MonitoringWorkShiftRow({ slot, periodLabel, period, client, shiftDate }: MonitoringWorkShiftRowProps) {
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const { executeAsync, isExecuting } = useAction(updateWorkShiftSlotStatusAction);

  const status = slot.status as WorkShiftSlotStatus;
  const statusLabel = WORK_SHIFT_SLOT_STATUS_LABELS[status] ?? slot.status;
  const statusColor = WORK_SHIFT_SLOT_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
  const contractLabel = ContractTypeOptions.find((o) => o.value === slot.contractType)?.label ?? slot.contractType;
  const nextTransitions = workShiftSlotStatusTransitions[status] ?? [];
  const primaryTransition = nextTransitions[0] as WorkShiftSlotStatus | undefined;

  const handleAdvanceStatus = async () => {
    if (!primaryTransition) return;
    const result = await executeAsync({ id: slot.id, status: primaryTransition });
    if (result?.data?.error) {
      toast.error(result.data.error);
    } else {
      toast.success(`Status atualizado para ${WORK_SHIFT_SLOT_STATUS_LABELS[primaryTransition]}`);
    }
  };

  const formatTime = (val: string | null | undefined) => {
    if (!val) return "--:--";
    return dayjs(val).format("HH:mm");
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border-l-4 border-l-primary bg-muted/30 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{slot.deliveryman?.name ?? "Sem entregador"}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              {period === planningPeriodConst.DAYTIME ? (
                <SunIcon className="size-3" />
              ) : (
                <MoonIcon className="size-3" />
              )}
              {periodLabel}
            </span>
            {slot.deliverymenPaymentValue && <span>{formatMoneyDisplay(slot.deliverymenPaymentValue)}</span>}
          </div>
        </div>

        <Badge variant="outline" className="shrink-0">
          {contractLabel}
        </Badge>

        <div className="shrink-0 text-center text-xs">
          <p className="text-muted-foreground">Planejado</p>
          <p className="font-medium">
            {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
          </p>
        </div>

        <div className="shrink-0 text-center text-xs">
          <p className="text-muted-foreground">Real</p>
          <p className="font-medium">
            {formatTime(slot.checkInAt)} — {formatTime(slot.checkOutAt)}
          </p>
        </div>

        <span
          className={cn("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium", statusColor)}
        >
          {statusLabel}
        </span>

        {primaryTransition && (
          <Button variant="outline" size="sm" onClick={handleAdvanceStatus} disabled={isExecuting} className="shrink-0">
            {isExecuting ? <Spinner className="mr-1 size-3" /> : null}
            {WORK_SHIFT_SLOT_STATUS_LABELS[primaryTransition]}
          </Button>
        )}

        <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => setDialogType("details")}>
          <EyeIcon className="size-4" />
        </Button>

        <Button variant="outline" size="sm" className="shrink-0" onClick={() => setDialogType("invite")}>
          <SendIcon className="mr-1 size-3.5" />
          Enviar convite
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 shrink-0">
              <EllipsisVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDialogType("annotation")}>Adicionar anotação</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditSheetOpen(true)}>Editar turno</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDialogType("edit-times")}>Editar horários</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDialogType("delete-shift")}>
              Excluir turno
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDialogType("ban")}>
              Banir entregador
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Other dialogs (placeholders for non-edit-shift features) */}
      <Dialog open={dialogType !== null} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "details" && "Detalhes do turno"}
              {dialogType === "invite" && "Enviar convite"}
              {dialogType === "annotation" && "Adicionar anotação"}
              {dialogType === "edit-times" && "Editar horários"}
              {dialogType === "delete-shift" && "Excluir turno"}
              {dialogType === "ban" && "Banir entregador"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Funcionalidade em desenvolvimento.</p>
        </DialogContent>
      </Dialog>

      {/* Edit shift Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-[30vw]">
          <SheetHeader>
            <SheetTitle>Editar turno</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <WorkShiftSlotForm
              client={client}
              shiftDate={shiftDate}
              isEditing
              defaultValues={{
                id: slot.id,
                status: slot.status,
                deliverymanId: slot.deliveryman?.id,
                deliverymanName: slot.deliveryman?.name,
                contractType: slot.contractType,
                period: slot.period,
                startTime: slot.startTime,
                endTime: slot.endTime,
                deliverymenPaymentValue: slot.deliverymenPaymentValue,
              }}
              onSuccess={() => setEditSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
