"use client";

import { Ban, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
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
  blockDeliverymanAction,
  deleteDeliverymanAction,
} from "@/lib/modules/deliverymen/deliverymen-actions";
import { CONTRACT_TYPE } from "@/lib/modules/deliverymen/deliverymen-constants";
import type { ListDeliverymenServiceResponse } from "@/lib/modules/deliverymen/deliverymen-service";
import { cpfMask } from "@/lib/masks/cpf-mask";
import { phoneMask } from "@/lib/masks/phone-mask";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface DeliverymenTableProps {
  deliverymen: ListDeliverymenServiceResponse["data"];
  loggedUser?: {
    id: string;
    role: string;
    permissions?: string[] | null;
  };
}

const contractTypeLabels: Record<string, string> = {
  [CONTRACT_TYPE.FREELANCER]: "Freelancer",
  [CONTRACT_TYPE.INDEPENDENT_COLLABORATOR]: "Colaborador independente",
};

const statusLabels = {
  active: "Ativo",
  blocked: "Bloqueado",
};

const statusColors = {
  active: "bg-green-500",
  blocked: "bg-red-500",
};

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(value));

export function DeliverymenTable({
  deliverymen,
  loggedUser,
}: DeliverymenTableProps) {
  const { execute: executeDelete, isExecuting: isDeleting } = useAction(
    deleteDeliverymanAction,
  );
  const { execute: executeBlock, isExecuting: isBlocking } = useAction(
    blockDeliverymanAction,
  );

  const can = (permission: string) =>
    loggedUser ? checkUserPermissions(loggedUser, [permission]) : false;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Documento</TableHead>
            <TableHead className="hidden md:table-cell">Telefone</TableHead>
            <TableHead className="hidden md:table-cell">
              Tipo de contrato
            </TableHead>
            <TableHead className="hidden md:table-cell">Situação</TableHead>
            <TableHead className="hidden md:table-cell">Criado em</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliverymen.length > 0 ? (
            deliverymen.map((deliveryman) => {
              const statusKey = deliveryman.isBlocked ? "blocked" : "active";
              return (
                <TableRow key={deliveryman.id}>
                  <TableCell className="font-medium">
                    {deliveryman.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {cpfMask(deliveryman.document)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {phoneMask(deliveryman.phone)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {contractTypeLabels[deliveryman.contractType] ||
                      deliveryman.contractType}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${statusColors[statusKey]}`}
                    >
                      {statusLabels[statusKey]}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {deliveryman.createdAt
                      ? formatDate(deliveryman.createdAt)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/app/entregadores/${deliveryman.id}`}>
                              <Eye />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualizar</p>
                        </TooltipContent>
                      </Tooltip>
                      {can("manager.edit") && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/app/entregadores/${deliveryman.id}/editar`}
                              >
                                <Pencil />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {can("manager.delete") && !deliveryman.isBlocked && (
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Ban />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Bloquear</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Deseja bloquear este entregador?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação impedirá o entregador de continuar
                                ativo no sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    executeBlock({ id: deliveryman.id })
                                  }
                                >
                                  {isBlocking ? "Bloqueando..." : "Bloquear"}
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {can("manager.delete") && (
                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Deseja excluir este entregador?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não poderá ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    executeDelete({ id: deliveryman.id })
                                  }
                                >
                                  {isDeleting ? "Excluindo..." : "Excluir"}
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Nenhum entregador encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
