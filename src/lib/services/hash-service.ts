import { createHmac } from "node:crypto";
import argon2 from "argon2";

export function hashService() {
  const hash = async (plain: string): Promise<string> => {
    const passwordWithPepper = createHmac(
      "sha256",
      process.env.AUTH_SECRET || "secret",
    )
      .update(plain)
      .digest("hex");

    return await argon2.hash(passwordWithPepper);
  };

  const compare = async (plain: string, hashed: string): Promise<boolean> => {
    try {
      const passwordWithPepper = createHmac(
        "sha256",
        process.env.AUTH_SECRET || "secret",
      )
        .update(plain)
        .digest("hex");

      return await argon2.verify(hashed, passwordWithPepper);
    } catch {
      return false;
    }
  };

  return { hash, compare };
}
