"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { cnpjMask } from "@/lib/masks/cnpj-mask";
import { deleteClientAction } from "@/lib/modules/clients/clients-actions";
import type { ListClientsServiceResponse } from "@/lib/modules/clients/clients-service";
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

interface ClientsTableProps {
  clients: ListClientsServiceResponse["data"];
  loggedUser?: {
    id: string;
    role: string;
    permissions?: string[] | null;
  };
}

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(value));

export function ClientsTable({ clients, loggedUser }: ClientsTableProps) {
  const { execute: executeDelete, isExecuting: isDeleting } =
    useAction(deleteClientAction);

  const can = (permission: string) =>
    loggedUser ? checkUserPermissions(loggedUser, [permission]) : false;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">CNPJ</TableHead>
            <TableHead className="hidden md:table-cell">Cidade/UF</TableHead>
            <TableHead className="hidden md:table-cell">Contato</TableHead>
            <TableHead className="hidden md:table-cell">Criado em</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length > 0 ? (
            clients.map((client) => {
              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {cnpjMask(client.cnpj)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.city} - {client.uf}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.contactName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {client.createdAt ? formatDate(client.createdAt) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/app/clientes/${client.id}`}>
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
                              <Link href={`/app/clientes/${client.id}/editar`}>
                                <Pencil />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
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
                                Deseja excluir este cliente?
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
                                    executeDelete({ id: client.id })
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
              <TableCell colSpan={6} className="text-center">
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
