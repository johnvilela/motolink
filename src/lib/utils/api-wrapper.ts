import { AppError } from "./app-error";

export async function apiWrapper(
  fc: () => Promise<Response>,
): Promise<Response> {
  try {
    return await fc();
  } catch (error) {
    if (error instanceof AppError) {
      return new Response(error.message, { status: error.code });
    }

    console.error(
      `[SERVER_ERROR][UnknownError]: ${error instanceof Error ? error.message : String(error)}`,
    );

    return new Response("Erro interno do servidor", { status: 500 });
  }
}
