import { redirect } from "next/navigation";
import { GroupForm } from "@/components/forms/group-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function NewGroupPage() {
  const user = await getUserLogged();

  const canCreateGroup = checkUserPermissions(user, ["manager.create"]);

  if (!canCreateGroup) {
    return redirect("/app/sem-permissao");
  }

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Grupos",
            href: "/app/gestao/grupos",
          },
          { title: "Novo Grupo" },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Cadastrar Grupo</Heading>
        <GroupForm user={user} />
      </main>
    </>
  );
}
