"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { cepMask } from "@/lib/masks/cep-mask";
import { cnpjMask } from "@/lib/masks/cnpj-mask";
import { mutateClientAction } from "@/lib/modules/clients/clients-actions";
import type { ClientsService } from "@/lib/modules/clients/clients-service";
import {
  type MutateClientDTO,
  MutateClientSchema,
} from "@/lib/modules/clients/clients-types";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Heading } from "../ui/heading";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Textfield } from "../ui/textfield";

type ClientFormDTO = Omit<MutateClientDTO, "branch" | "commercialCondition">;

type ClientDetails = Awaited<ReturnType<ClientsService["getById"]>>;

interface ClientFormProps {
  loggedUser: {
    id: string;
    role: string;
    permissions?: string[] | null;
  };
  regions: Array<{ id: string; name: string }>;
  groups: Array<{ id: string; name: string }>;
  clientToBeEdited?: ClientDetails;
}

export function ClientForm({
  loggedUser,
  regions,
  groups,
  clientToBeEdited,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ClientFormDTO>({
    resolver: zodResolver(
      MutateClientSchema.omit({ branch: true, commercialCondition: true }),
    ),
    defaultValues: {
      id: clientToBeEdited?.id,
      name: clientToBeEdited?.name ?? "",
      cnpj: clientToBeEdited?.cnpj ?? "",
      contactName: clientToBeEdited?.contactName ?? "",
      cep: clientToBeEdited?.cep ?? "",
      street: clientToBeEdited?.street ?? "",
      number: clientToBeEdited?.number ?? "",
      complement: clientToBeEdited?.complement ?? "",
      neighborhood: clientToBeEdited?.neighborhood ?? "",
      city: clientToBeEdited?.city ?? "",
      uf: clientToBeEdited?.uf ?? "",
      regionId: clientToBeEdited?.regionId ?? null,
      groupId: clientToBeEdited?.groupId ?? null,
    },
  });

  const { execute, isExecuting, result } = useAction(mutateClientAction);

  const cnpjValue = watch("cnpj");
  const cepValue = watch("cep");
  const selectedRegionId = watch("regionId");
  const selectedGroupId = watch("groupId");
  const canSubmit = checkUserPermissions(loggedUser, [
    clientToBeEdited ? "manager.edit" : "manager.create",
  ]);

  const cnpjField = register("cnpj");
  const cepField = register("cep");

  return (
    <form
      className="flex flex-col gap-4 my-2 p-4"
      onSubmit={handleSubmit(execute)}
      autoComplete="off"
    >
      {result.serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error {result.serverError.code}</AlertTitle>
          <AlertDescription>{result.serverError.message}</AlertDescription>
        </Alert>
      )}
      <input type="hidden" {...register("id")} />

      <fieldset className="space-y-4">
        <Heading variant="h4">Informações Básicas</Heading>
        <div className="grid gap-4 md:grid-cols-3">
          <Textfield
            type="text"
            label="Nome"
            error={errors.name?.message}
            {...register("name")}
          />
          <Textfield
            type="text"
            label="CNPJ"
            error={errors.cnpj?.message}
            {...cnpjField}
            value={cnpjValue}
            inputMode="numeric"
            onChange={(event) =>
              setValue("cnpj", cnpjMask(event.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <Textfield
            type="text"
            label="Nome do Contato"
            error={errors.contactName?.message}
            {...register("contactName")}
          />
        </div>
      </fieldset>

      <Separator className="my-6" />

      <fieldset className="space-y-4">
        <Heading variant="h4">Endereço</Heading>
        <div className="grid gap-4 md:grid-cols-4">
          <Textfield
            type="text"
            label="CEP"
            error={errors.cep?.message}
            {...cepField}
            value={cepValue}
            inputMode="numeric"
            onChange={(event) =>
              setValue("cep", cepMask(event.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <div className="md:col-span-2">
            <Textfield
              type="text"
              label="Rua"
              error={errors.street?.message}
              {...register("street")}
            />
          </div>
          <Textfield
            type="text"
            label="Número"
            error={errors.number?.message}
            {...register("number")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Textfield
            type="text"
            label="Complemento"
            error={errors.complement?.message}
            {...register("complement")}
          />
          <Textfield
            type="text"
            label="Bairro"
            error={errors.neighborhood?.message}
            {...register("neighborhood")}
          />
          <Textfield
            type="text"
            label="Cidade"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Textfield
            type="text"
            label="UF"
            error={errors.uf?.message}
            maxLength={2}
            {...register("uf")}
          />
        </div>
      </fieldset>

      <Separator className="my-6" />

      <fieldset className="space-y-4">
        <Heading variant="h4">Relacionamentos</Heading>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="regionId">Região</Label>
            <Select
              value={selectedRegionId ?? "none"}
              onValueChange={(value) =>
                setValue("regionId", value === "none" ? null : value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem região</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="groupId">Grupo</Label>
            <Select
              value={selectedGroupId ?? "none"}
              onValueChange={(value) =>
                setValue("groupId", value === "none" ? null : value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem grupo</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>

      {canSubmit ? (
        <Button type="submit" isLoading={isExecuting} className="mt-4">
          {clientToBeEdited ? "Salvar alterações" : "Cadastrar"}
        </Button>
      ) : null}
    </form>
  );
}
