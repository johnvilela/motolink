import { UserForm } from "@/components/forms/user-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";
import { redirect } from "next/navigation";

export default async function NewColaboratorPage() {
  const user = await getUserLogged();

  const canCreateUser = checkUserPermissions(user, ["employee.create"]);

  if (!canCreateUser) {
    return redirect("/app/sem-permissao");
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
            title: "Novo Colaborador",
          },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Cadastrar Colaborador</Heading>
        <UserForm user={user} />
      </main>
    </>
  );
}
