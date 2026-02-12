import { PlusIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { ContentHeader } from "@/components/composite/content-header";
import { TablePagination } from "@/components/composite/table-pagination";
import { TextSearch } from "@/components/composite/text-search";
import { GroupsTable } from "@/components/tables/groups-table";
import { Button } from "@/components/ui/button";
import { cookieConst } from "@/constants/cookies";
import { groupsService } from "@/modules/groups/groups-service";
import { groupListQuerySchema } from "@/modules/groups/groups-types";

interface GruposPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function GruposPage({ searchParams }: GruposPageProps) {
  const params = await searchParams;
  const store = await cookies();
  const branchId = store.get(cookieConst.SELECTED_BRANCH)?.value;

  const { page, pageSize, search } = groupListQuerySchema.parse({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    search: params.search,
    branchId,
  });

  const { data: groups, pagination } = await groupsService().listAll({
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
          { title: "Grupos" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <TextSearch placeholder="Pesquisar por nome..." className="max-w-sm" />
        <Button asChild>
          <Link href="/gestao/grupos/novo">
            <PlusIcon />
            Novo grupo
          </Link>
        </Button>
      </div>

      <GroupsTable groups={groups} />

      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        currentSearch={search}
      />
    </div>
  );
}
