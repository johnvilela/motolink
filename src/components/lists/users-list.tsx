"use client";

import {
  EllipsisVerticalIcon,
  EyeIcon,
  InfoIcon,
  MailIcon,
  PencilIcon,
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
import { deleteUserAction, toggleBlockUserAction } from "@/modules/users/users-actions";

interface UserListItem {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface UsersListProps {
  users: UserListItem[];
  canView?: boolean;
  canEdit?: boolean;
  isAdmin?: boolean;
}

const statusBorderMap: Record<string, string> = {
  [statusConst.ACTIVE]: "border-l-emerald-500",
  [statusConst.INACTIVE]: "border-l-gray-400",
  [statusConst.PENDING]: "border-l-amber-400",
  [statusConst.BLOCKED]: "border-l-red-400",
};

export function UsersList({ users, canView = true, canEdit = true, isAdmin = false }: UsersListProps) {
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [blockTarget, setBlockTarget] = useState<UserListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteUserAction(deleteTarget.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Colaborador excluído com sucesso");
      }

      setDeleteTarget(null);
    });
  }

  function handleToggleBlock() {
    if (!blockTarget) return;

    startTransition(async () => {
      const result = await toggleBlockUserAction(blockTarget.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.isBlocked ? "Colaborador bloqueado com sucesso" : "Colaborador desbloqueado com sucesso");
      }

      setBlockTarget(null);
    });
  }

  if (users.length === 0) {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>Nenhum registro</AlertTitle>
        <AlertDescription>
          Nenhum colaborador cadastrado ainda. Clique em "Novo colaborador" para começar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {users.map((user) => {
          const statusSurface = statusBorderMap[user.status] ?? "border-l-gray-400";

          return (
            <Card
              key={user.id}
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
                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <StatusBadge status={user.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MailIcon className="size-3.5" />
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 self-end md:self-center">
                    {canView && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon-sm" asChild>
                            <Link href={`/gestao/colaboradores/${user.id}`}>
                              <EyeIcon />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalhes</TooltipContent>
                      </Tooltip>
                    )}

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
                        {canEdit && (
                          <DropdownMenuItem asChild>
                            <Link href={`/gestao/colaboradores/${user.id}/editar`}>
                              <PencilIcon className="mr-2 size-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setBlockTarget(user)}>
                              {user.status === statusConst.BLOCKED ? (
                                <>
                                  <ShieldCheckIcon className="mr-2 size-4" />
                                  Desbloquear
                                </>
                              ) : (
                                <>
                                  <ShieldBanIcon className="mr-2 size-4" />
                                  Bloquear
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(user)}>
                              <Trash2Icon className="mr-2 size-4" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        <p className="text-center text-xs text-muted-foreground">
          Total de {users.length} {users.length === 1 ? "colaborador" : "colaboradores"}
        </p>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este colaborador? Essa ação não pode ser desfeita.
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

      <AlertDialog
        open={!!blockTarget}
        onOpenChange={(open) => {
          if (!open) setBlockTarget(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.status === statusConst.BLOCKED ? "Desbloquear colaborador" : "Bloquear colaborador"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.status === statusConst.BLOCKED
                ? "Tem certeza que deseja desbloquear este colaborador? Ele poderá acessar o sistema novamente."
                : "Tem certeza que deseja bloquear este colaborador? Ele perderá acesso ao sistema imediatamente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant={blockTarget?.status === statusConst.BLOCKED ? "default" : "destructive"}
              disabled={isPending}
              onClick={handleToggleBlock}
            >
              {blockTarget?.status === statusConst.BLOCKED ? "Desbloquear" : "Bloquear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
