import { redirect } from "next/navigation";
import { RegionForm } from "@/components/forms/region-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function NewRegionPage() {
  const user = await getUserLogged();

  const canCreateRegion = checkUserPermissions(user, ["manager.create"]);

  if (!canCreateRegion) {
    return redirect("/app/sem-permissao");
  }

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Regiões",
            href: "/app/gestao/regiao",
          },
          { title: "Nova Região" },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Cadastrar Região</Heading>
        <RegionForm user={user} />
      </main>
    </>
  );
}
