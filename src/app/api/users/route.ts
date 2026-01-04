import { type NextRequest, NextResponse } from "next/server";
import { usersService } from "@/lib/modules/users/user-service";
import { apiWrapper } from "@/lib/utils/api-wrapper";

export async function POST(request: NextRequest) {
  return await apiWrapper(async () => {
    const data = await request.json();
    const user = await usersService().create(data);
    return NextResponse.json(user);
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const cursor = searchParams.get("cursor") || undefined;
  const limit = searchParams.has("limit")
    ? Number(searchParams.get("limit"))
    : 10;

  try {
    const result = await usersService().list({ search, cursor, limit });
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const deletedUser = await usersService().delete(id);
    return NextResponse.json(deletedUser);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
