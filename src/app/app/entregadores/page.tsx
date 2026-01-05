import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeliverymenTable } from "@/components/tables/deliveryman-table";
import { SearchTextField } from "@/components/tables/search-textfield";
import { TablePagination } from "@/components/tables/table-pagination";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { cookieNames } from "@/lib/constants/cookie-names";
import { contractTypeArr } from "@/lib/modules/deliverymen/deliverymen-constants";
import { deliverymenService } from "@/lib/modules/deliverymen/deliverymen-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function DeliverymenPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: number;
    name?: string;
    document?: string;
    phone?: string;
    contractType?: string;
    regionId?: string;
  }>;
}) {
  const {
    page = 1,
    search = "",
    name = "",
    document = "",
    phone = "",
    contractType,
    regionId,
  } = await searchParams;

  const loggedUser = await getUserLogged();
  const canViewDeliverymen = checkUserPermissions(loggedUser, ["manager.view"]);

  if (!canViewDeliverymen) {
    return redirect("/app/sem-permissao");
  }

  const cookieStore = await cookies();
  const currentBranch = cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;

  const currentPage = Number(page) || 1;
  const normalizedSearch = typeof search === "string" ? search.trim() : "";
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedDocument =
    typeof document === "string" ? document.trim() : "";
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
  const normalizedRegionId =
    typeof regionId === "string" ? regionId.trim() : "";
  const normalizedContractType = contractTypeArr.includes(
    contractType as (typeof contractTypeArr)[number],
  )
    ? (contractType as (typeof contractTypeArr)[number])
    : undefined;

  let nameFilter = normalizedName;
  let documentFilter = normalizedDocument;
  let phoneFilter = normalizedPhone;

  if (!nameFilter && !documentFilter && !phoneFilter && normalizedSearch) {
    const searchHasLetters = /[a-zA-Z]/.test(normalizedSearch);
    const searchDigits = normalizedSearch.replace(/\D/g, "");

    if (searchHasLetters) {
      nameFilter = normalizedSearch;
    } else if (searchDigits.length >= 10) {
      phoneFilter = normalizedSearch;
    } else {
      documentFilter = normalizedSearch;
    }
  }

  const deliverymen = await deliverymenService().list({
    page: currentPage,
    limit: 10,
    name: nameFilter || undefined,
    document: documentFilter || undefined,
    phone: phoneFilter || undefined,
    contractType: normalizedContractType,
    regionId: normalizedRegionId || undefined,
    branch: currentBranch,
  });

  const canCreateDeliveryman = checkUserPermissions(loggedUser, [
    "manager.create",
  ]);

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Entregadores",
          },
        ]}
      />
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between pb-4">
          <Heading variant="h2">Entregadores ({deliverymen.count})</Heading>
          {canCreateDeliveryman ? (
            <Link href="/app/entregadores/novo">
              <Button>Criar Entregador</Button>
            </Link>
          ) : null}
        </div>

        <div className="pb-4">
          <SearchTextField
            baseUrl="/app/entregadores"
            placeholder="Buscar por nome, documento ou telefone"
          />
        </div>

        <DeliverymenTable
          deliverymen={deliverymen.data}
          loggedUser={loggedUser}
        />

        <TablePagination
          totalCount={deliverymen.count}
          page={currentPage}
          baseUrl="/app/entregadores"
        />
      </div>
    </>
  );
}
