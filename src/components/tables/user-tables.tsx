"use client";

import { Link as LinkIcon, Pencil, Trash2 } from "lucide-react";
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
import type { ListUserServiceResponse } from "@/lib/modules/users/user-service";
import { deleteUserAction } from "@/lib/modules/users/users-actions";
import {
  userStatus,
  userStatusTranslations,
} from "@/lib/modules/users/users-constants";
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

interface UsersTableProps {
  users: ListUserServiceResponse["data"];
  loggedUser?: {
    id: string;
    role: string;
    permissions?: string[] | null;
  };
}

const statusColors = {
  ACTIVE: "bg-green-500",
  BLOCKED: "bg-red-500",
  PENDING: "bg-yellow-500",
};

export function UsersTable({ users, loggedUser }: UsersTableProps) {
  const { execute, isExecuting } = useAction(deleteUserAction);

  const can = (permission: string) =>
    loggedUser ? checkUserPermissions(loggedUser, [permission]) : false;

  function copyLinkToClipboard(token: string) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/primeiro-login?token=${token}`;
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Cargo</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.email}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.role}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${statusColors[user.status as keyof typeof statusColors]}`}
                  >
                    {userStatusTranslations[user.status]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <TooltipProvider>
                    {user.status === userStatus.PENDING && can("employee.create") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyLinkToClipboard(
                                user.verificationTokens[0].token,
                              )
                            }
                          >
                            <LinkIcon />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar link de acesso</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {loggedUser?.id !== user.id && (
                      <>
                        {can("employee.edit") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/app/colaboradores/${user.id}`}>
                                  <Pencil />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {can("employee.delete") && (
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
                                  Desejar excluir este colaborador?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação apagará o acesso do colaborador ao
                                  sistema, mas os dados relacionados a ele serão
                                  mantidos para fins históricos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() => execute({ id: user.id })}
                                  >
                                    {isExecuting ? "Excluindo..." : "Excluir"}
                                  </Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </>
                    )}
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Nenhum colaborador encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
