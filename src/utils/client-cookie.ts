type CookieStoreLike = {
  set(options: { name: string; value: string; path?: string; expires?: Date }): Promise<void>;
};

type WindowWithCookieStore = Window & typeof globalThis & { cookieStore?: CookieStoreLike };

interface SetClientCookieOptions {
  maxAge: number;
  path?: string;
}

function fallbackSetCookie(name: string, value: string, { maxAge, path = "/" }: SetClientCookieOptions) {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API is not available in every browser.
  document.cookie = `${name}=${value}; path=${path}; max-age=${maxAge}`;
}

export function setClientCookie(name: string, value: string, options: SetClientCookieOptions) {
  const cookieStore = (window as WindowWithCookieStore).cookieStore;

  if (!cookieStore) {
    fallbackSetCookie(name, value, options);
    return;
  }

  void cookieStore
    .set({
      name,
      value,
      path: options.path ?? "/",
      expires: new Date(Date.now() + options.maxAge * 1000),
    })
    .catch(() => {
      fallbackSetCookie(name, value, options);
    });
}
