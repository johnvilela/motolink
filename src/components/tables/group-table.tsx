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
import { deleteGroupAction } from "@/lib/modules/groups/groups-actions";
import type { ListGroupsServiceResponse } from "@/lib/modules/groups/groups-service";
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

interface GroupsTableProps {
  groups: ListGroupsServiceResponse["data"];
  loggedUser?: {
    id: string;
    role: string;
    permissions?: string[] | null;
  };
}

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(value));

export function GroupsTable({ groups, loggedUser }: GroupsTableProps) {
  const { execute, isExecuting } = useAction(deleteGroupAction);

  const can = (permission: string) =>
    loggedUser ? checkUserPermissions(loggedUser, [permission]) : false;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Descrição</TableHead>
            <TableHead className="hidden md:table-cell">Criado em</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length > 0 ? (
            groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {group.description || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {group.createdAt ? formatDate(group.createdAt) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/gestao/grupos/${group.id}`}>
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
                              href={`/app/gestao/grupos/${group.id}/editar`}
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
                              Deseja excluir este grupo?
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
                                onClick={() => execute({ id: group.id })}
                              >
                                {isExecuting ? "Excluindo..." : "Excluir"}
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Nenhum grupo encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
