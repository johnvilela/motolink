import { PlusIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { ContentHeader } from "@/components/composite/content-header";
import { TablePagination } from "@/components/composite/table-pagination";
import { TextSearch } from "@/components/composite/text-search";
import { RegionsTable } from "@/components/tables/regions-table";
import { Button } from "@/components/ui/button";
import { cookieConst } from "@/constants/cookies";
import { regionsService } from "@/modules/regions/regions-service";
import { regionListQuerySchema } from "@/modules/regions/regions-types";
import { getCurrentUser } from "@/modules/users/users-queries";
import { hasPermissions } from "@/utils/has-permissions";
import requirePermissions from "@/utils/require-permissions";

interface RegioesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RegioesPage({ searchParams }: RegioesPageProps) {
  const params = await searchParams;
  const store = await cookies();
  const branchId = store.get(cookieConst.SELECTED_BRANCH)?.value;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["regions.view"], "Regiões");

  const { page, pageSize, search } = regionListQuerySchema.parse({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    search: params.search,
    branchId,
  });

  const { data: regions, pagination } = await regionsService().listAll({
    page,
    pageSize,
    search,
    branchId,
  });

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Regiões" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <TextSearch placeholder="Pesquisar por nome..." className="max-w-sm" />
        {hasPermissions(currentUser, ["regions.create"]) && (
          <Button asChild>
            <Link href="/gestao/regioes/novo">
              <PlusIcon />
              Nova região
            </Link>
          </Button>
        )}
      </div>

      <RegionsTable
        regions={regions}
        canView={hasPermissions(currentUser, ["regions.view"])}
        canEdit={hasPermissions(currentUser, ["regions.edit"])}
        canDelete={hasPermissions(currentUser, ["regions.delete"])}
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
