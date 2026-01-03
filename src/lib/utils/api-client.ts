// lib/api-client.ts

type ApiResult<T> =
  | { data: T; error: null; status: number }
  | { data: null; error: string; status: number; code?: string };

export const api = {
  async get<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        ...options,
        method: "GET",
      });

      if (!res.ok) {
        return {
          data: null,
          error: `A requisição falhou com o status ${res.status}`,
          status: res.status,
        };
      }

      const data = await res.json();
      return { data, error: null, status: res.status };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Erro de rede desconhecido",
        status: 500,
      };
    }
  },

  async post<T>(
    url: string,
    body: unknown,
    options?: RequestInit,
  ): Promise<ApiResult<T>> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        ...options,
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json", ...options?.headers },
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          data: null,
          error: data.message || "Algo deu errado",
          status: res.status,
          code: data.code,
        };
      }

      return { data, error: null, status: res.status };
    } catch (_) {
      return { data: null, error: "A conexão de rede falhou", status: 500 };
    }
  },
};
