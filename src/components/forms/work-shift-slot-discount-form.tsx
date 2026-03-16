"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createDiscountAction } from "@/modules/work-shift-slots/work-shift-slots-actions";
import { applyMoneyMask } from "@/utils/masks/money-mask";

const formSchema = z.object({
  amount: z.string().min(1, { message: "Valor é obrigatório" }),
  reason: z.string().min(1, { message: "Motivo é obrigatório" }),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkShiftSlotDiscountFormProps {
  slotId: string;
  onSuccess?: () => void;
}

function parseMoneyToNumber(masked: string): number {
  const cleaned = masked.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
  return Number.parseFloat(cleaned) || 0;
}

export function WorkShiftSlotDiscountForm({ slotId, onSuccess }: WorkShiftSlotDiscountFormProps) {
  const { executeAsync, isExecuting } = useAction(createDiscountAction);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      reason: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const amount = parseMoneyToNumber(values.amount);
    if (amount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    const result = await executeAsync({
      workShiftSlotId: slotId,
      amount,
      reason: values.reason,
    });

    if (result?.data?.error) {
      toast.error(result.data.error);
      return;
    }

    toast.success("Desconto adicionado com sucesso");
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field>
        <FieldLabel>Valor</FieldLabel>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder="R$ 0,00" onChange={(e) => field.onChange(applyMoneyMask(e.target.value))} />
          )}
        />
        {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Motivo</FieldLabel>
        <Textarea {...register("reason")} placeholder="Descreva o motivo do desconto" />
        {errors.reason && <FieldError>{errors.reason.message}</FieldError>}
      </Field>

      <Button type="submit" disabled={isExecuting} className="w-full">
        {isExecuting && <Spinner className="mr-1 size-3" />}
        Salvar desconto
      </Button>
    </form>
  );
}
