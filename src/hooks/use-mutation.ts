import { useState } from "react";

export function useMutation<T>(fc: () => Promise<T | undefined>) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  async function mutate() {
    setStatus("loading");
    setError(null);
    setData(null);

    try {
      const res = (await fc()) as T;

      setData(res);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setStatus("error");
    }
  }

  return { mutate, status, error, data };
}
