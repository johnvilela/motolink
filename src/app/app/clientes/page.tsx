import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientsTable } from "@/components/tables/client-table";
import { SearchTextField } from "@/components/tables/search-textfield";
import { TablePagination } from "@/components/tables/table-pagination";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { cookieNames } from "@/lib/constants/cookie-names";
import { clientsService } from "@/lib/modules/clients/clients-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: number;
    name?: string;
    cnpj?: string;
  }>;
}) {
  const { page = 1, search = "", name = "", cnpj = "" } = await searchParams;

  const loggedUser = await getUserLogged();
  const canViewClients = checkUserPermissions(loggedUser, ["manager.view"]);

  if (!canViewClients) {
    return redirect("/app/sem-permissao");
  }

  const cookieStore = await cookies();
  const currentBranch = cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;

  const currentPage = Number(page) || 1;
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedCnpj = typeof cnpj === "string" ? cnpj.trim() : "";

  let nameFilter = normalizedName;
  let cnpjFilter = normalizedCnpj;

  if (!nameFilter && !cnpjFilter && normalizedSearch) {
    const searchHasLetters = /[a-zA-Z]/.test(normalizedSearch);

    if (searchHasLetters) {
      nameFilter = normalizedSearch;
    } else {
      cnpjFilter = normalizedSearch;
    }
  }

  const clients = await clientsService().list({
    page: currentPage,
    limit: 10,
    name: nameFilter || undefined,
    cnpj: cnpjFilter || undefined,
    branch: currentBranch,
  });

  const canCreateClient = checkUserPermissions(loggedUser, ["manager.create"]);

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Clientes",
          },
        ]}
      />
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between pb-4">
          <Heading variant="h2">Clientes ({clients.count})</Heading>
          {canCreateClient ? (
            <Link href="/app/clientes/novo">
              <Button>Novo Cliente</Button>
            </Link>
          ) : null}
        </div>

        <div className="pb-4">
          <SearchTextField
            baseUrl="/app/clientes"
            placeholder="Buscar por nome ou CNPJ"
          />
        </div>

        <ClientsTable clients={clients.data} loggedUser={loggedUser} />

        <TablePagination
          totalCount={clients.count}
          page={currentPage}
          baseUrl="/app/clientes"
        />
      </div>
    </>
  );
}
