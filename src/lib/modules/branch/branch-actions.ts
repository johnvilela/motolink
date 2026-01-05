"use server";

import { cookies } from "next/headers";
import { cookieNames } from "@/lib/constants/cookie-names";

export async function getCurrentBranch() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;
}

export async function setCurrentBranch(branch: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieNames.CURRENT_BRANCH, branch, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}
