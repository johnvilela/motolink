import { UserForm } from "@/components/forms/user-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { usersService } from "@/lib/modules/users/user-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";
import { redirect } from "next/navigation";

export default async function EditColaboratorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserLogged();
  const canEditUser = checkUserPermissions(user, ["employee.edit"]);

  if (!canEditUser) {
    return redirect("/app/sem-permissao");
  }

  const userToBeEdited = await usersService().getById(id);

  if (!userToBeEdited) {
    return <div>Usuário não encontrado</div>;
  }

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Colaboradores",
            href: "/app/colaboradores",
          },
          {
            title: "Editar Colaborador",
          },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Editar Colaborador</Heading>
        <UserForm user={user} userToBeEdited={userToBeEdited} />
      </main>
    </>
  );
}
