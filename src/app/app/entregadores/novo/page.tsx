import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeliverymanForm } from "@/components/forms/deliveryman-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { cookieNames } from "@/lib/constants/cookie-names";
import { regionsService } from "@/lib/modules/regions/regions-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function NewDeliverymanPage() {
  const loggedUser = await getUserLogged();
  const canCreateDeliveryman = checkUserPermissions(loggedUser, [
    "manager.create",
  ]);

  if (!canCreateDeliveryman) {
    return redirect("/app/sem-permissao");
  }

  const cookieStore = await cookies();
  const currentBranch = cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;

  const regions = await regionsService().listAll({
    page: 1,
    limit: 100,
    branch: currentBranch,
  });

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Entregadores",
            href: "/app/entregadores",
          },
          {
            title: "Novo Entregador",
          },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Cadastrar Entregador</Heading>
        <DeliverymanForm
          loggedUser={loggedUser}
          regions={regions.data.map((region) => ({
            id: region.id,
            name: region.name,
          }))}
        />
      </main>
    </>
  );
}
