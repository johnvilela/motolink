import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { RegionForm } from "@/components/forms/region-form";
import { regionsService } from "@/modules/regions/regions-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import requirePermissions from "@/utils/require-permissions";

interface EditarRegiaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarRegiaoPage({
  params,
}: EditarRegiaoPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["regions.edit"], "Regiões");

  const region = await regionsService().getById(id);

  if (!region) {
    notFound();
  }

  const defaultValues = {
    id: region.id,
    name: region.name,
    description: region.description ?? "",
  };

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Regiões", href: "/gestao/regioes" },
          { title: region.name, href: `/gestao/regioes/${id}` },
          { title: "Editar" },
        ]}
      />

      <RegionForm
        defaultValues={defaultValues}
        isEditing
        redirectTo="/gestao/regioes"
      />
    </div>
  );
}
