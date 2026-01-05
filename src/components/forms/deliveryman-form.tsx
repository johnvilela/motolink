"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { cpfMask } from "@/lib/masks/cpf-mask";
import { phoneMask } from "@/lib/masks/phone-mask";
import { mutateDeliverymanAction } from "@/lib/modules/deliverymen/deliverymen-actions";
import {
  CONTRACT_TYPE,
  contractTypeArr,
} from "@/lib/modules/deliverymen/deliverymen-constants";
import type { DeliverymenService } from "@/lib/modules/deliverymen/deliverymen-service";
import {
  MutateDeliverymanSchema,
  type MutateDeliverymanDTO,
} from "@/lib/modules/deliverymen/deliverymen-types";
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

type DeliverymanFormDTO = Omit<MutateDeliverymanDTO, "branch">;

type DeliverymanDetails = Awaited<ReturnType<DeliverymenService["getById"]>>;

interface DeliverymanFormProps {
  loggedUser: {
    id: string;
    role: string;
    permissions?: string[] | null;
  };
  regions: Array<{ id: string; name: string }>;
  deliverymanToBeEdited?: DeliverymanDetails;
}

const contractTypeLabels: Record<string, string> = {
  [CONTRACT_TYPE.FREELANCER]: "Freelancer",
  [CONTRACT_TYPE.INDEPENDENT_COLLABORATOR]: "Colaborador independente",
};

export function DeliverymanForm({
  loggedUser,
  regions,
  deliverymanToBeEdited,
}: DeliverymanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DeliverymanFormDTO>({
    resolver: zodResolver(MutateDeliverymanSchema.omit({ branch: true })),
    defaultValues: {
      id: deliverymanToBeEdited?.id,
      name: deliverymanToBeEdited?.name ?? "",
      document: deliverymanToBeEdited?.document ?? "",
      phone: deliverymanToBeEdited?.phone ?? "",
      contractType:
        (deliverymanToBeEdited?.contractType as DeliverymanFormDTO["contractType"]) ??
        CONTRACT_TYPE.FREELANCER,
      mainPixKey: deliverymanToBeEdited?.mainPixKey ?? "",
      secondPixKey: deliverymanToBeEdited?.secondPixKey ?? "",
      thridPixKey: deliverymanToBeEdited?.thridPixKey ?? "",
      agency: deliverymanToBeEdited?.agency ?? "",
      account: deliverymanToBeEdited?.account ?? "",
      vehicleModel: deliverymanToBeEdited?.vehicleModel ?? "",
      vehiclePlate: deliverymanToBeEdited?.vehiclePlate ?? "",
      vehicleColor: deliverymanToBeEdited?.vehicleColor ?? "",
      regionId: deliverymanToBeEdited?.regionId ?? null,
    },
  });

  const { execute, isExecuting, result } = useAction(mutateDeliverymanAction);

  const selectedContractType = watch("contractType");
  const documentValue = watch("document");
  const phoneValue = watch("phone");
  const selectedRegionId = watch("regionId");
  const canSubmit = checkUserPermissions(loggedUser, [
    deliverymanToBeEdited ? "manager.edit" : "manager.create",
  ]);

  const documentField = register("document");
  const phoneField = register("phone");

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
        <div className="grid gap-4 md:grid-cols-2">
          <Textfield
            type="text"
            label="Nome"
            error={errors.name?.message}
            {...register("name")}
          />
          <Textfield
            type="text"
            label="Documento"
            error={errors.document?.message}
            {...documentField}
            value={documentValue}
            inputMode="numeric"
            onChange={(event) =>
              setValue("document", cpfMask(event.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <Textfield
            type="tel"
            label="Telefone"
            error={errors.phone?.message}
            {...phoneField}
            value={phoneValue}
            inputMode="numeric"
            onChange={(event) =>
              setValue("phone", phoneMask(event.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
          <div>
            <Label htmlFor="contractType">Tipo de contrato</Label>
            <Select
              value={selectedContractType}
              onValueChange={(value) =>
                setValue(
                  "contractType",
                  value as DeliverymanFormDTO["contractType"],
                  {
                    shouldValidate: true,
                  },
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo de contrato" />
              </SelectTrigger>
              <SelectContent>
                {contractTypeArr.map((contractType) => (
                  <SelectItem key={contractType} value={contractType}>
                    {contractTypeLabels[contractType] || contractType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contractType && (
              <p className="text-xs text-red-600 mt-1">
                {errors.contractType.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <Separator className="my-6" />

      <fieldset className="space-y-4">
        <Heading variant="h4">Informações de Pagamento</Heading>
        <div className="grid gap-4 md:grid-cols-3">
          <Textfield
            type="text"
            label="Chave PIX principal"
            error={errors.mainPixKey?.message}
            {...register("mainPixKey")}
          />
          <Textfield
            type="text"
            label="Chave PIX secundária"
            error={errors.secondPixKey?.message}
            {...register("secondPixKey")}
          />
          <Textfield
            type="text"
            label="Chave PIX terciária"
            error={errors.thridPixKey?.message}
            {...register("thridPixKey")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Textfield
            type="text"
            label="Agência"
            error={errors.agency?.message}
            {...register("agency")}
          />
          <Textfield
            type="text"
            label="Conta"
            error={errors.account?.message}
            {...register("account")}
          />
        </div>
      </fieldset>

      <Separator className="my-6" />

      <fieldset className="space-y-4">
        <Heading variant="h4">Informações do Veículo</Heading>
        <div className="grid gap-4 md:grid-cols-3">
          <Textfield
            type="text"
            label="Modelo do veículo"
            error={errors.vehicleModel?.message}
            {...register("vehicleModel")}
          />
          <Textfield
            type="text"
            label="Placa do veículo"
            error={errors.vehiclePlate?.message}
            {...register("vehiclePlate")}
          />
          <Textfield
            type="text"
            label="Cor do veículo"
            error={errors.vehicleColor?.message}
            {...register("vehicleColor")}
          />
        </div>
      </fieldset>

      <Separator className="my-6" />

      <fieldset className="space-y-4">
        <Heading variant="h4">Localização</Heading>
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
        </div>
      </fieldset>

      {canSubmit ? (
        <Button type="submit" isLoading={isExecuting} className="mt-4">
          {deliverymanToBeEdited ? "Salvar alterações" : "Cadastrar"}
        </Button>
      ) : null}
    </form>
  );
}
