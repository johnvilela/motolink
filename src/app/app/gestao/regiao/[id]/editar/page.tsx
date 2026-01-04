import { redirect } from "next/navigation";
import { RegionForm } from "@/components/forms/region-form";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Heading } from "@/components/ui/heading";
import { regionsService } from "@/lib/modules/regions/regions-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function EditRegionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserLogged();

  const canEditRegion = checkUserPermissions(user, ["manager.edit"]);

  if (!canEditRegion) {
    return redirect("/app/sem-permissao");
  }

  const regionToBeEdited = await regionsService().getById(id);

  if (!regionToBeEdited) {
    return <div>Região não encontrada</div>;
  }

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Regiões",
            href: "/app/gestao/regiao",
          },
          { title: "Editar Região" },
        ]}
      />
      <main className="container mx-auto py-10">
        <Heading variant="h2">Editar Região</Heading>
        <RegionForm user={user} regionToBeEdited={regionToBeEdited} />
      </main>
    </>
  );
}
