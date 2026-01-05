import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GroupsTable } from "@/components/tables/group-table";
import { SearchTextField } from "@/components/tables/search-textfield";
import { TablePagination } from "@/components/tables/table-pagination";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { cookieNames } from "@/lib/constants/cookie-names";
import { groupsService } from "@/lib/modules/groups/groups-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function GroupsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: number }>;
}) {
  const { page = 1, search = "" } = await searchParams;
  const loggedUser = await getUserLogged();
  const canViewGroups = checkUserPermissions(loggedUser, ["manager.view"]);

  if (!canViewGroups) {
    return redirect("/app/sem-permissao");
  }

  const cookieStore = await cookies();
  const currentBranch = cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;

  const currentPage = Number(page) || 1;
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const groups = await groupsService().listAll({
    name: normalizedSearch || undefined,
    limit: 10,
    page: currentPage,
    branch: currentBranch,
  });
  const canCreateGroup = checkUserPermissions(loggedUser, ["manager.create"]);

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Grupos",
          },
        ]}
      />
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between pb-4">
          <Heading variant="h2">Grupos ({groups.count})</Heading>
          {canCreateGroup ? (
            <Link href="/app/gestao/grupos/novo">
              <Button>Criar Grupo</Button>
            </Link>
          ) : null}
        </div>

        <div className="pb-4">
          <SearchTextField
            baseUrl="/app/gestao/grupos"
            placeholder="Buscar por nome"
          />
        </div>

        <GroupsTable groups={groups.data} loggedUser={loggedUser} />

        <TablePagination
          totalCount={groups.count}
          page={currentPage}
          baseUrl="/app/gestao/grupos"
        />
      </div>
    </>
  );
}
