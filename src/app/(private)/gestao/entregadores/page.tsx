import { PlusIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { ContentHeader } from "@/components/composite/content-header";
import { TablePagination } from "@/components/composite/table-pagination";
import { TextSearch } from "@/components/composite/text-search";
import { DeliverymenTable } from "@/components/tables/deliverymen-table";
import { Button } from "@/components/ui/button";
import { cookieConst } from "@/constants/cookies";
import { deliverymanService } from "@/modules/deliveryman/deliveryman-service";
import { deliverymanListQuerySchema } from "@/modules/deliveryman/deliveryman-types";
import { getCurrentUser } from "@/modules/users/users-queries";
import { hasPermissions } from "@/utils/has-permissions";
import requirePermissions from "@/utils/require-permissions";

interface EntregadoresPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EntregadoresPage({
  searchParams,
}: EntregadoresPageProps) {
  const params = await searchParams;
  const store = await cookies();
  const branchId = store.get(cookieConst.SELECTED_BRANCH)?.value;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["deliverymen.view"], "Entregadores");

  const { page, pageSize, search } = deliverymanListQuerySchema.parse({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    search: params.search,
    branchId,
  });

  const { data: deliverymen, pagination } = await deliverymanService().listAll({
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
          { title: "Entregadores" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <TextSearch
          placeholder="Pesquisar por nome, CPF ou telefone..."
          className="max-w-sm"
        />
        {hasPermissions(currentUser, ["deliverymen.create"]) && (
          <Button asChild>
            <Link href="/gestao/entregadores/novo">
              <PlusIcon />
              Novo entregador
            </Link>
          </Button>
        )}
      </div>

      <DeliverymenTable
        deliverymen={deliverymen}
        canView={hasPermissions(currentUser, ["deliverymen.view"])}
        canEdit={hasPermissions(currentUser, ["deliverymen.edit"])}
        canDelete={hasPermissions(currentUser, ["deliverymen.delete"])}
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
