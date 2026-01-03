import z from "zod";
import { db } from "@/lib/services/database";
import { hashService } from "@/lib/services/hash-service";
import { AppError } from "@/lib/utils/app-error";
import { type MutateUserDTO, MutateUserSchema } from "./user-types";

export function userService() {
  return {
    async create(data: Omit<MutateUserDTO, "id">) {
      const { data: validatedData, error } = MutateUserSchema.safeParse(data);

      if (error) {
        throw new AppError("Campos inválidos", 400);
      }

      const hashedPassword = await hashService().hash(validatedData.password);

      const user = await db.user.create({
        data: {
          ...validatedData,
          password: hashedPassword,
        },
        omit: {
          password: true,
        },
      });

      return user;
    },
  };
}
