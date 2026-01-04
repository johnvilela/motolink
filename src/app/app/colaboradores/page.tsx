import { cookies } from "next/headers";
import Link from "next/link";
import { SearchTextField } from "@/components/tables/search-textfield";
import { TablePagination } from "@/components/tables/table-pagination";
import { UsersTable } from "@/components/tables/user-tables";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { cookieNames } from "@/lib/constants/cookie-names";
import { usersService } from "@/lib/modules/users/user-service";

export default async function ColaboratorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: number }>;
}) {
  const cookiesStore = await cookies();
  const { page = 1, search = "" } = await searchParams;
  const loggedUserId = cookiesStore.get(cookieNames.USER_ID)?.value;
  const users = await usersService().list({
    search: search || undefined,
    limit: 10,
    page,
  });

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Colaboradores",
          },
        ]}
      />
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between pb-4">
          <Heading variant="h2">Colaboradores ({users.count})</Heading>
          <Link href="/app/colaboradores/novo">
            <Button>Criar Colaborador</Button>
          </Link>
        </div>

        <div className="pb-4">
          <SearchTextField baseUrl="/app/colaboradores" />
        </div>

        <UsersTable users={users.data} loggedUserId={loggedUserId} />

        <TablePagination
          totalCount={users.count}
          page={page}
          baseUrl="/app/colaboradores"
        />
      </div>
    </>
  );
}
