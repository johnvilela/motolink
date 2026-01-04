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
import { deleteRegionAction } from "@/lib/modules/regions/regions-actions";
import type { ListRegionsServiceResponse } from "@/lib/modules/regions/regions-service";
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

interface RegionsTableProps {
  regions: ListRegionsServiceResponse["data"];
  loggedUser?: {
    id: string;
    role: string;
    permissions?: string[] | null;
  };
}

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(value));

export function RegionsTable({ regions, loggedUser }: RegionsTableProps) {
  const { execute, isExecuting } = useAction(deleteRegionAction);

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
          {regions.length > 0 ? (
            regions.map((region) => (
              <TableRow key={region.id}>
                <TableCell className="font-medium">{region.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {region.description || "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {region.createdAt ? formatDate(region.createdAt) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/gestao/regiao/${region.id}`}>
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
                              href={`/app/gestao/regiao/${region.id}/editar`}
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
                              Deseja excluir esta região?
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
                                onClick={() => execute({ id: region.id })}
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
                Nenhuma região encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
