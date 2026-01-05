import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientForm } from "@/components/forms/client-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { cookieNames } from "@/lib/constants/cookie-names";
import { clientsService } from "@/lib/modules/clients/clients-service";
import { groupsService } from "@/lib/modules/groups/groups-service";
import { regionsService } from "@/lib/modules/regions/regions-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loggedUser = await getUserLogged();

  const canEditClient = checkUserPermissions(loggedUser, ["manager.edit"]);

  if (!canEditClient) {
    return redirect("/app/sem-permissao");
  }

  const clientToBeEdited = await clientsService()
    .getById(id)
    .catch(() => null);

  if (!clientToBeEdited) {
    return <div>Cliente não encontrado</div>;
  }

  const cookieStore = await cookies();
  const currentBranch = cookieStore.get(cookieNames.CURRENT_BRANCH)?.value;

  const regions = await regionsService().listAll({
    page: 1,
    limit: 100,
    branch: currentBranch,
  });

  const groups = await groupsService().listAll({
    page: 1,
    limit: 100,
    branch: currentBranch,
  });

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Clientes",
            href: "/app/clientes",
          },
          {
            title: "Editar Cliente",
          },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Editar Cliente</Heading>
        <ClientForm
          loggedUser={loggedUser}
          clientToBeEdited={clientToBeEdited}
          regions={regions.data.map((region) => ({
            id: region.id,
            name: region.name,
          }))}
          groups={groups.data.map((group) => ({
            id: group.id,
            name: group.name,
          }))}
        />
      </main>
    </>
  );
}
