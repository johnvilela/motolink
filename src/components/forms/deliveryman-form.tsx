"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  FileInput,
  type FileInputItem,
  type FileValidationError,
  isFileObject,
} from "@/components/composite/file-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colorsConst } from "@/constants/colors";
import { ContractTypeOptions } from "@/constants/contract-type";
import { vehicleTypesConst } from "@/constants/vehicle-type";
import { mutateDeliverymanAction } from "@/modules/deliveryman/deliveryman-actions";
import {
  type DeliverymanMutateInput,
  deliverymanMutateSchema,
} from "@/modules/deliveryman/deliveryman-types";
import { fileManagement } from "@/utils/file-management";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

interface Region {
  id: string;
  name: string;
}

interface DeliverymanFormProps {
  regions: Region[];
  defaultValues?: Partial<DeliverymanMutateInput>;
  isEditing?: boolean;
  onSuccess?: () => void;
  redirectTo?: string;
}

export function DeliverymanForm({
  regions,
  defaultValues,
  isEditing = false,
  onSuccess,
  redirectTo,
}: DeliverymanFormProps) {
  const router = useRouter();
  const { execute, isExecuting, result } = useAction(mutateDeliverymanAction);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DeliverymanMutateInput>({
    resolver: zodResolver(deliverymanMutateSchema),
    defaultValues: {
      id: defaultValues?.id,
      name: defaultValues?.name ?? "",
      document: defaultValues?.document ?? "",
      phone: defaultValues?.phone ?? "",
      contractType: defaultValues?.contractType ?? "",
      mainPixKey: defaultValues?.mainPixKey ?? "",
      secondPixKey: defaultValues?.secondPixKey ?? "",
      thridPixKey: defaultValues?.thridPixKey ?? "",
      agency: defaultValues?.agency ?? "",
      account: defaultValues?.account ?? "",
      vehicleModel: defaultValues?.vehicleModel ?? "",
      vehiclePlate: defaultValues?.vehiclePlate ?? "",
      vehicleColor: defaultValues?.vehicleColor ?? "",
      regionId: defaultValues?.regionId ?? "",
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [formFiles, setFormFiles] = useState<FileInputItem[]>(
    defaultValues?.files ?? [],
  );

  const handleFileValidationError = useCallback(
    (errors: FileValidationError[]) => {
      for (const error of errors) {
        toast.error(error.message);
      }
    },
    [],
  );

  useEffect(() => {
    if (result.data?.success) {
      toast.success(
        isEditing ? "Entregador atualizado." : "Entregador criado.",
      );
      if (onSuccess) {
        onSuccess();
      }
      if (redirectTo) {
        router.push(redirectTo);
      }
      return;
    }

    if (result.data?.error) {
      toast.error(result.data.error);
    }
  }, [result, isEditing, onSuccess, redirectTo, router]);

  async function onSubmit(data: DeliverymanMutateInput) {
    try {
      setIsUploading(true);

      const existingUrls = formFiles.filter(
        (item): item is string => typeof item === "string",
      );
      const newFiles = formFiles.filter(isFileObject);

      let uploadedUrls: string[] = [];

      if (newFiles.length > 0) {
        try {
          uploadedUrls = await fileManagement().upload({
            files: newFiles,
            path: "deliverymen",
          });
        } catch {
          toast.error("Erro ao enviar arquivos. Tente novamente.");
          return;
        }
      }

      const allFileUrls = [...existingUrls, ...uploadedUrls];

      execute({
        ...data,
        files: allFileUrls,
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <FieldSet>
        <FieldLegend>Informações Pessoais</FieldLegend>

        <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
          <Field className="md:col-span-2" data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Nome</FieldLabel>
            <Input
              id="name"
              placeholder="Nome completo"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={!!errors.document}>
            <FieldLabel htmlFor="document">CPF</FieldLabel>
            <Input
              id="document"
              placeholder="000.000.000-00"
              aria-invalid={!!errors.document}
              {...register("document", {
                onChange: (e) => {
                  e.target.value = applyCpfMask(e.target.value);
                },
              })}
            />
            <FieldError errors={[errors.document]} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Telefone</FieldLabel>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              aria-invalid={!!errors.phone}
              {...register("phone", {
                onChange: (e) => {
                  e.target.value = applyPhoneMask(e.target.value);
                },
              })}
            />
            <FieldError errors={[errors.phone]} />
          </Field>

          <Field data-invalid={!!errors.contractType}>
            <FieldLabel htmlFor="contractType">Tipo de Contrato</FieldLabel>
            <Controller
              name="contractType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="contractType" className="w-full">
                    <SelectValue placeholder="Selecione o tipo de contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {ContractTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.contractType]} />
          </Field>

          <Field data-invalid={!!errors.regionId}>
            <FieldLabel htmlFor="regionId">Região</FieldLabel>
            <Controller
              name="regionId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="regionId" className="w-full">
                    <SelectValue placeholder="Selecione uma região" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.regionId]} />
          </Field>
        </FieldGroup>

        <Field className="mt-4">
          <FieldLabel>Documentos</FieldLabel>
          <FileInput
            value={formFiles}
            onChange={setFormFiles}
            disabled={isExecuting || isUploading}
            onValidationError={handleFileValidationError}
          />
          <FieldDescription>
            Adicione documentos do entregador (CNH, RG, comprovante de
            residência, etc.)
          </FieldDescription>
        </Field>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Informações Financeiras</FieldLegend>

        <FieldGroup className="grid grid-cols-1 md:grid-cols-2">
          <Field data-invalid={!!errors.mainPixKey}>
            <FieldLabel htmlFor="mainPixKey">Chave PIX Principal</FieldLabel>
            <Input
              id="mainPixKey"
              placeholder="Chave PIX principal"
              aria-invalid={!!errors.mainPixKey}
              {...register("mainPixKey")}
            />
            <FieldError errors={[errors.mainPixKey]} />
          </Field>

          <Field data-invalid={!!errors.secondPixKey}>
            <FieldLabel htmlFor="secondPixKey">Chave PIX Secundária</FieldLabel>
            <Input
              id="secondPixKey"
              placeholder="Chave PIX secundária (opcional)"
              aria-invalid={!!errors.secondPixKey}
              {...register("secondPixKey")}
            />
            <FieldError errors={[errors.secondPixKey]} />
          </Field>

          <Field data-invalid={!!errors.thridPixKey}>
            <FieldLabel htmlFor="thridPixKey">Chave PIX Terciária</FieldLabel>
            <Input
              id="thridPixKey"
              placeholder="Chave PIX terciária (opcional)"
              aria-invalid={!!errors.thridPixKey}
              {...register("thridPixKey")}
            />
            <FieldError errors={[errors.thridPixKey]} />
          </Field>

          <Field data-invalid={!!errors.agency}>
            <FieldLabel htmlFor="agency">Agência</FieldLabel>
            <Input
              id="agency"
              placeholder="Número da agência (opcional)"
              aria-invalid={!!errors.agency}
              {...register("agency")}
            />
            <FieldError errors={[errors.agency]} />
          </Field>

          <Field data-invalid={!!errors.account}>
            <FieldLabel htmlFor="account">Conta</FieldLabel>
            <Input
              id="account"
              placeholder="Número da conta (opcional)"
              aria-invalid={!!errors.account}
              {...register("account")}
            />
            <FieldError errors={[errors.account]} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Veículo</FieldLegend>

        <FieldGroup className="grid grid-cols-1 md:grid-cols-3">
          <Field data-invalid={!!errors.vehicleModel}>
            <FieldLabel htmlFor="vehicleModel">Modelo</FieldLabel>
            <Controller
              name="vehicleModel"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="vehicleModel" className="w-full">
                    <SelectValue placeholder="Selecione o modelo do veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypesConst.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.vehicleModel]} />
          </Field>

          <Field data-invalid={!!errors.vehiclePlate}>
            <FieldLabel htmlFor="vehiclePlate">Placa</FieldLabel>
            <Input
              id="vehiclePlate"
              placeholder="Placa do veículo (opcional)"
              aria-invalid={!!errors.vehiclePlate}
              {...register("vehiclePlate")}
            />
            <FieldError errors={[errors.vehiclePlate]} />
          </Field>

          <Field data-invalid={!!errors.vehicleColor}>
            <FieldLabel htmlFor="vehicleColor">Cor</FieldLabel>
            <Controller
              name="vehicleColor"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="vehicleColor" className="w-full">
                    <SelectValue placeholder="Selecione a cor do veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorsConst.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.vehicleColor]} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex md:justify-end">
        <Button
          type="submit"
          isLoading={isExecuting || isUploading}
          className="w-full md:w-auto"
        >
          {isUploading
            ? "Enviando arquivos..."
            : isEditing
              ? "Salvar Alterações"
              : "Criar Entregador"}
        </Button>
      </div>

      {result.data?.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{result.data.error}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
