import Link from "next/link";
import { redirect } from "next/navigation";
import { RegionsTable } from "@/components/tables/region-table";
import { SearchTextField } from "@/components/tables/search-textfield";
import { TablePagination } from "@/components/tables/table-pagination";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { regionsService } from "@/lib/modules/regions/regions-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function RegionsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: number }>;
}) {
  const { page = 1, search = "" } = await searchParams;
  const loggedUser = await getUserLogged();
  const canViewRegions = checkUserPermissions(loggedUser, ["manager.view"]);

  if (!canViewRegions) {
    return redirect("/app/sem-permissao");
  }

  const currentPage = Number(page) || 1;
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const regions = await regionsService().listAll({
    name: normalizedSearch || undefined,
    limit: 10,
    page: currentPage,
  });

  const canCreateRegion = checkUserPermissions(loggedUser, ["manager.create"]);

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Regiões",
          },
        ]}
      />
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between pb-4">
          <Heading variant="h2">Regiões ({regions.count})</Heading>
          {canCreateRegion ? (
            <Link href="/app/gestao/regiao/nova">
              <Button>Criar Região</Button>
            </Link>
          ) : null}
        </div>

        <div className="pb-4">
          <SearchTextField
            baseUrl="/app/gestao/regiao"
            placeholder="Buscar por nome"
          />
        </div>

        <RegionsTable regions={regions.data} loggedUser={loggedUser} />

        <TablePagination
          totalCount={regions.count}
          page={currentPage}
          baseUrl="/app/gestao/regiao"
        />
      </div>
    </>
  );
}
