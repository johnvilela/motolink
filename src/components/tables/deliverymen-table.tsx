"use client";

import {
  EyeIcon,
  InfoIcon,
  PencilIcon,
  ShieldBan,
  ShieldCheck,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  deleteDeliverymanAction,
  toggleDeliverymanAction,
} from "@/modules/deliveryman/deliveryman-actions";

interface Deliveryman {
  id: string;
  name: string;
  document: string;
  phone: string;
  isBlocked: boolean;
}

interface DeliverymenTableProps {
  deliverymen: Deliveryman[];
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function DeliverymenTable({
  deliverymen,
  canView = true,
  canEdit = true,
  canDelete = true,
}: DeliverymenTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Deliveryman | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Deliveryman | null>(null);
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
    if (!toggleTarget) return;

    startTransition(async () => {
      const result = await toggleDeliverymanAction(toggleTarget.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          toggleTarget.isBlocked
            ? "Entregador desbloqueado com sucesso"
            : "Entregador bloqueado com sucesso",
        );
      }

      setToggleTarget(null);
    });
  }

  if (deliverymen.length === 0) {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>Nenhum registro</AlertTitle>
        <AlertDescription>
          Nenhum entregador cadastrado ainda. Clique em &quot;Novo
          entregador&quot; para começar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-4/12">Nome</TableHead>
            <TableHead className="hidden w-2/12 md:table-cell">CPF</TableHead>
            <TableHead className="hidden w-2/12 md:table-cell">
              Telefone
            </TableHead>
            <TableHead className="hidden w-1/12 md:table-cell">
              Status
            </TableHead>
            <TableHead className="w-3/12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliverymen.map((deliveryman) => (
            <TableRow key={deliveryman.id}>
              <TableCell className="truncate">{deliveryman.name}</TableCell>
              <TableCell className="hidden truncate md:table-cell">
                {deliveryman.document}
              </TableCell>
              <TableCell className="hidden truncate md:table-cell">
                {deliveryman.phone}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <StatusBadge
                  status={deliveryman.isBlocked ? "BLOCKED" : "ACTIVE"}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {canView && (
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
                  )}

                  {canEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link
                            href={`/gestao/entregadores/${deliveryman.id}/editar`}
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  )}

                  {canEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setToggleTarget(deliveryman)}
                        >
                          {deliveryman.isBlocked ? (
                            <ShieldCheck />
                          ) : (
                            <ShieldBan />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {deliveryman.isBlocked ? "Desbloquear" : "Bloquear"}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {canDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(deliveryman)}
                        >
                          <Trash2Icon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
              Tem certeza que deseja excluir este entregador? Essa ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.isBlocked
                ? "Desbloquear entregador"
                : "Bloquear entregador"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.isBlocked
                ? "Tem certeza que deseja desbloquear este entregador? Ele poderá receber novas atribuições."
                : "Tem certeza que deseja bloquear este entregador? Ele não poderá receber novas atribuições enquanto estiver bloqueado."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={toggleTarget?.isBlocked ? "default" : "destructive"}
              disabled={isPending}
              onClick={handleToggleBlock}
            >
              {toggleTarget?.isBlocked ? "Desbloquear" : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
