"use client";

import {
  EllipsisVerticalIcon,
  EyeIcon,
  FileTextIcon,
  InfoIcon,
  PencilIcon,
  PhoneIcon,
  ShieldBanIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/composite/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { statusConst } from "@/constants/status";
import { cn } from "@/lib/cn";
import { deleteDeliverymanAction, toggleBlockDeliverymanAction } from "@/modules/deliverymen/deliverymen-actions";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

interface DeliverymanListItem {
  id: string;
  name: string;
  phone: string;
  document: string;
  isBlocked: boolean;
}

interface DeliverymenListProps {
  deliverymen: DeliverymanListItem[];
}

export function DeliverymenList({ deliverymen }: DeliverymenListProps) {
  const [deleteTarget, setDeleteTarget] = useState<DeliverymanListItem | null>(null);
  const [blockTarget, setBlockTarget] = useState<DeliverymanListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteDeliverymanAction(deleteTarget.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Entregador excluído com sucesso");
      }

      setDeleteTarget(null);
    });
  }

  function handleToggleBlock() {
    if (!blockTarget) return;

    startTransition(async () => {
      const result = await toggleBlockDeliverymanAction(blockTarget.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.isBlocked ? "Entregador bloqueado com sucesso" : "Entregador desbloqueado com sucesso");
      }

      setBlockTarget(null);
    });
  }

  if (deliverymen.length === 0) {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>Nenhum registro</AlertTitle>
        <AlertDescription>Nenhum entregador cadastrado ainda.</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {deliverymen.map((deliveryman) => {
          const statusSurface = deliveryman.isBlocked ? "border-l-red-400" : "border-l-emerald-500";

          return (
            <Card
              key={deliveryman.id}
              className="overflow-hidden border-border/70 bg-card py-0 shadow-none transition-colors hover:bg-muted/10"
            >
              <CardContent className="p-0">
                <div
                  className={cn(
                    "flex flex-col gap-2.5 border-l-4 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-3",
                    statusSurface,
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">{deliveryman.name}</p>
                      <StatusBadge status={deliveryman.isBlocked ? statusConst.BLOCKED : statusConst.ACTIVE} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <PhoneIcon className="size-3.5" />
                        {applyPhoneMask(deliveryman.phone)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-current opacity-50" />
                        <FileTextIcon className="size-3.5" />
                        {applyCpfMask(deliveryman.document)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 self-end md:self-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/gestao/entregadores/${deliveryman.id}`}>
                            <EyeIcon />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalhes</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <EllipsisVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Mais ações</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={`/gestao/entregadores/${deliveryman.id}/editar`}>
                            <PencilIcon className="mr-2 size-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setBlockTarget(deliveryman)}>
                          {deliveryman.isBlocked ? (
                            <ShieldCheckIcon className="mr-2 size-4" />
                          ) : (
                            <ShieldBanIcon className="mr-2 size-4" />
                          )}
                          {deliveryman.isBlocked ? "Desbloquear" : "Bloquear"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(deliveryman)}>
                          <Trash2Icon className="mr-2 size-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <p className="text-center text-xs text-muted-foreground">
          Total de {deliverymen.length} {deliverymen.length === 1 ? "entregador" : "entregadores"}
        </p>
      </div>

      <AlertDialog
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.isBlocked ? "Desbloquear entregador" : "Bloquear entregador"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.isBlocked
                ? "Tem certeza que deseja desbloquear este entregador?"
                : "Tem certeza que deseja bloquear este entregador?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleToggleBlock}>
              {blockTarget?.isBlocked ? "Desbloquear" : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir entregador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este entregador? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isPending} onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
