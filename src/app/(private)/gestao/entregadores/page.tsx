import { AlertCircleIcon } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { TablePagination } from "@/components/composite/table-pagination";
import { TextSearch } from "@/components/composite/text-search";
import { DeliverymenList } from "@/components/lists/deliverymen-list";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cookieConst } from "@/constants/cookies";
import { deliverymenService } from "@/modules/deliverymen/deliverymen-service";
import { checkPagePermission } from "@/utils/check-page-permission";

interface EntregadoresPageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
  }>;
}

export default async function EntregadoresPage({ searchParams }: EntregadoresPageProps) {
  if (!(await checkPagePermission("deliverymen.view"))) return <AccessDenied />;

  const cookieStore = await cookies();
  const branchId = cookieStore.get(cookieConst.SELECTED_BRANCH)?.value;

  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const pageSize = Number(params?.pageSize) || 10;
  const search = params?.search ?? "";

  const result = await deliverymenService().listAll({
    page,
    pageSize,
    search,
    branchId,
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      {result.isErr() && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{result.error.reason}</AlertDescription>
        </Alert>
      )}

      {result.isOk() && (
        <>
          <ContentHeader breadcrumbItems={[{ title: "Entregadores" }]} />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TextSearch placeholder="Pesquisar entregadores..." />
            <Button asChild>
              <Link href="/gestao/entregadores/novo">Adicionar entregador</Link>
            </Button>
          </div>
          <DeliverymenList deliverymen={result.value.data} />
          <TablePagination
            page={result.value.pagination.page}
            pageSize={result.value.pagination.pageSize}
            totalPages={result.value.pagination.totalPages}
            currentSearch={search}
          />
        </>
      )}
    </main>
  );
}
