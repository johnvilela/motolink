"use client";

import {
  EllipsisVerticalIcon,
  EyeIcon,
  InfoIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
import { deleteClientAction } from "@/modules/clients/clients-actions";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

interface ClientListItem {
  id: string;
  name: string;
  city: string;
  uf: string;
  contactPhone: string;
  contactName: string;
}

interface ClientsListProps {
  clients: ClientListItem[];
}

export function ClientsList({ clients }: ClientsListProps) {
  const [deleteTarget, setDeleteTarget] = useState<ClientListItem | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      const result = await deleteClientAction(deleteTarget.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cliente excluído com sucesso");
      }

      setDeleteTarget(null);
    });
  }

  if (clients.length === 0) {
    return (
      <Alert>
        <InfoIcon />
        <AlertTitle>Nenhum registro</AlertTitle>
        <AlertDescription>Nenhum cliente cadastrado ainda.</AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="overflow-hidden border-border/70 bg-card py-0 shadow-none transition-colors hover:bg-muted/10"
          >
            <CardContent className="p-0">
              <div className="flex flex-col gap-2.5 bg-card px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="min-w-0 truncate text-sm font-semibold text-foreground">{client.name}</p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPinIcon className="size-3.5" />
                      {client.city}/{client.uf}
                    </span>
                    {client.contactPhone && (
                      <>
                        <span className="size-1 rounded-full bg-current opacity-50" />
                        <span className="inline-flex items-center gap-1.5">
                          <PhoneIcon className="size-3.5" />
                          {applyPhoneMask(client.contactPhone)}
                        </span>
                      </>
                    )}
                    {client.contactName && (
                      <>
                        <span className="size-1 rounded-full bg-current opacity-50" />
                        <span className="inline-flex items-center gap-1.5">
                          <UserIcon className="size-3.5" />
                          {client.contactName}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 self-end md:self-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link href={`/gestao/clientes/${client.id}`}>
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
                        <Link href={`/gestao/clientes/${client.id}/editar`}>
                          <PencilIcon className="mr-2 size-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(client)}>
                        <Trash2Icon className="mr-2 size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <p className="text-center text-xs text-muted-foreground">
          Total de {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
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
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.
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
