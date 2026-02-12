import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { ContentHeader } from "@/components/composite/content-header";
import { TablePagination } from "@/components/composite/table-pagination";
import { TextSearch } from "@/components/composite/text-search";
import { UsersTable } from "@/components/tables/users-table";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/modules/users/users-queries";
import { usersService } from "@/modules/users/users-service";
import { userListQuerySchema } from "@/modules/users/users-types";
import { hasPermissions } from "@/utils/has-permissions";
import requirePermissions from "@/utils/require-permissions";

interface ColaboradoresPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ColaboradoresPage({
  searchParams,
}: ColaboradoresPageProps) {
  const params = await searchParams;

  const currentUser = await getCurrentUser();

  requirePermissions(currentUser, ["users.view"], "Colaboradores");

  const { page, pageSize, search } = userListQuerySchema.parse({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    search: params.search,
  });

  const { data: users, pagination } = await usersService().listAll({
    page,
    pageSize,
    search,
  });

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Colaboradores" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <TextSearch
          placeholder="Pesquisar por nome ou e-mail..."
          className="max-w-sm"
        />
        {hasPermissions(currentUser, ["users.create"]) && (
          <Button asChild>
            <Link href="/gestao/colaboradores/novo">
              <PlusIcon />
              Novo colaborador
            </Link>
          </Button>
        )}
      </div>

      <UsersTable
        users={users}
        canView={hasPermissions(currentUser, ["users.view"])}
        canEdit={hasPermissions(currentUser, ["users.edit"])}
        canDelete={hasPermissions(currentUser, ["users.delete"])}
      />

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        currentSearch={search}
      />
    </div>
  );
}
