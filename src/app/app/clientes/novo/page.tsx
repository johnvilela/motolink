import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClientForm } from "@/components/forms/client-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { cookieNames } from "@/lib/constants/cookie-names";
import { groupsService } from "@/lib/modules/groups/groups-service";
import { regionsService } from "@/lib/modules/regions/regions-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function NewClientPage() {
  const loggedUser = await getUserLogged();
  const canCreateClient = checkUserPermissions(loggedUser, ["manager.create"]);

  if (!canCreateClient) {
    return redirect("/app/sem-permissao");
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
            title: "Novo Cliente",
          },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Cadastrar Cliente</Heading>
        <ClientForm
          loggedUser={loggedUser}
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
