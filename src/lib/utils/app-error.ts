import { APIError } from "better-auth";

type ErrorsMap = {
  [domain: string]: {
    [statusCode: number]: string;
  };
};

type AppErrorOptions =
  | {
      error: unknown;
      message?: string;
      code?: number;
    }
  | {
      error?: never;
      message: string;
      code?: number;
    };

const errorsTranslated: ErrorsMap = {
  auth: {
    422: "Usuário já existe",
  },
};

class AppError {
  message: string = "Erro desconhecido";
  code?: number = 400;

  constructor(options: AppErrorOptions) {
    const { error, code, message: optionsMessage } = options;
    const defaultMsg = "Erro desconhecido";
    const defaultCode = 400;

    if (!error) {
      this.message = optionsMessage || defaultMsg;
      this.code = code || defaultCode;
      return;
    }

    if (error instanceof APIError) {
      const translatedMessage = errorsTranslated.auth[error.statusCode] || null;

      this.message = translatedMessage || optionsMessage || defaultMsg;
      this.code = Number(code || error.statusCode || defaultCode);
      return;
    } else if (error instanceof Error) {
      this.message = optionsMessage || error.message || defaultMsg;
      this.code = Number(code);
      return;
    }

    this.message = optionsMessage || defaultMsg;
    this.code = Number(code || defaultCode);
  }
}

export { AppError };
