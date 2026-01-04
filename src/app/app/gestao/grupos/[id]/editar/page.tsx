import { redirect } from "next/navigation";
import { GroupForm } from "@/components/forms/group-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { groupsService } from "@/lib/modules/groups/groups-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserLogged();

  const canEditGroup = checkUserPermissions(user, ["manager.edit"]);

  if (!canEditGroup) {
    return redirect("/app/sem-permissao");
  }

  const groupToBeEdited = await groupsService().getById(id);

  if (!groupToBeEdited) {
    return <div>Grupo não encontrado</div>;
  }

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Grupos",
            href: "/app/gestao/grupos",
          },
          { title: "Editar Grupo" },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Editar Grupo</Heading>
        <GroupForm user={user} groupToBeEdited={groupToBeEdited} />
      </main>
    </>
  );
}
