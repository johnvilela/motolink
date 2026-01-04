import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchTextField } from "@/components/tables/search-textfield";
import { TablePagination } from "@/components/tables/table-pagination";
import { UsersTable } from "@/components/tables/user-tables";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { usersService } from "@/lib/modules/users/user-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function ColaboratorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: number }>;
}) {
  const { page = 1, search = "" } = await searchParams;
  const loggedUser = await getUserLogged();
  const canViewUsers = checkUserPermissions(loggedUser, ["employee.view"]);

  if (!canViewUsers) {
    return redirect("/app/sem-permissao");
  }

  const users = await usersService().list({
    search: search || undefined,
    limit: 10,
    page,
  });
  const canCreateUser = checkUserPermissions(loggedUser, ["employee.create"]);

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
          {canCreateUser ? (
            <Link href="/app/colaboradores/novo">
              <Button>Criar Colaborador</Button>
            </Link>
          ) : null}
        </div>

        <div className="pb-4">
          <SearchTextField baseUrl="/app/colaboradores" />
        </div>

        <UsersTable users={users.data} loggedUser={loggedUser} />

        <TablePagination
          totalCount={users.count}
          page={page}
          baseUrl="/app/colaboradores"
        />
      </div>
    </>
  );
}
