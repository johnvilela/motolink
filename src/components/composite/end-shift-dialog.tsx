"use client";

import { useCallback, useState } from "react";

import { SingleBadgeSelect } from "@/components/composite/single-badge-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  WORK_SHIFT_SLOT_STATUS_LABELS,
  type WorkShiftSlotStatus,
  workShiftSlotStatusTransitions,
} from "@/constants/work-shift-slot-status";

const END_SHIFT_STATUSES: WorkShiftSlotStatus[] = ["CANCELLED", "UNANSWERED", "REJECTED"];

interface EndShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: WorkShiftSlotStatus;
  isMutating: boolean;
  isPending: boolean;
  onConfirm: (status: WorkShiftSlotStatus, cancelledReason?: string) => void;
}

export function getEndShiftOptions(currentStatus: WorkShiftSlotStatus) {
  const allowed = workShiftSlotStatusTransitions[currentStatus] ?? [];
  return END_SHIFT_STATUSES.filter((s) => allowed.includes(s));
}

export function EndShiftDialog({
  open,
  onOpenChange,
  currentStatus,
  isMutating,
  isPending,
  onConfirm,
}: EndShiftDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [cancelledReason, setCancelledReason] = useState("");

  const options = getEndShiftOptions(currentStatus).map((s) => ({
    value: s,
    label: WORK_SHIFT_SLOT_STATUS_LABELS[s],
  }));

  const isCancelled = selectedStatus === "CANCELLED";
  const canConfirm = selectedStatus && (!isCancelled || cancelledReason.trim()) && !isMutating;

  const reset = useCallback(() => {
    setSelectedStatus(null);
    setCancelledReason("");
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange(next);
      if (!next) reset();
    },
    [onOpenChange, reset],
  );

  const handleConfirm = useCallback(() => {
    if (!selectedStatus) return;
    onConfirm(selectedStatus as WorkShiftSlotStatus, isCancelled ? cancelledReason.trim() : undefined);
  }, [selectedStatus, isCancelled, cancelledReason, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar turno</DialogTitle>
          <DialogDescription>
            Selecione o motivo para encerrar este turno. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium">Status</p>
            <SingleBadgeSelect value={selectedStatus} onChange={setSelectedStatus} options={options} />
          </div>

          {isCancelled && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">Motivo do cancelamento *</p>
              <Textarea
                value={cancelledReason}
                onChange={(e) => setCancelledReason(e.target.value)}
                placeholder="Descreva o motivo do cancelamento"
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Voltar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!canConfirm}>
            {isPending ? <Spinner className="mr-1 size-3" /> : null}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
