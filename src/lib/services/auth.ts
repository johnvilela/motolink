import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { UserTypes } from "../constants/user-types";
import { db } from "./database";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: [...Object.values(UserTypes)],
        required: true,
        defaultValue: UserTypes.USER,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
