"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { createSessionAction } from "@/lib/modules/sessions/actions";
import {
  type CreateSessionDTO,
  createSessionSchema,
} from "@/lib/modules/sessions/types";

export const LoginForm = () => {
  const { register, handleSubmit } = useForm<CreateSessionDTO>({
    resolver: zodResolver(createSessionSchema),
  });
  const { execute, isExecuting } = useAction(createSessionAction);

  return (
    <form onSubmit={handleSubmit(execute)}>
      <input placeholder="Email" type="text" {...register("email")} />
      <input placeholder="Password" type="password" {...register("password")} />
      <button type="submit">{isExecuting ? "Loading..." : "Login"}</button>
    </form>
  );
};
