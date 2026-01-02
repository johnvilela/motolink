import { createSafeActionClient } from "next-safe-action";
import { AppError } from "../utils/app-error";

export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    if (error instanceof AppError) {
      return { message: error.message, isOperational: true };
    }

    console.error(`[SERVER_ACTION][UnknownError]: ${error.message}`);

    return {
      message: "Erro interno do servidor",
      isOperational: false,
    };
  },
});
