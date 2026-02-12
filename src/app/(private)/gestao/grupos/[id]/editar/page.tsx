import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { GroupForm } from "@/components/forms/group-form";
import { groupsService } from "@/modules/groups/groups-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import requirePermissions from "@/utils/require-permissions";

interface EditarGrupoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarGrupoPage({
  params,
}: EditarGrupoPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["groups.edit"], "Grupos");

  const group = await groupsService().getById(id);

  if (!group) {
    notFound();
  }

  const defaultValues = {
    id: group.id,
    name: group.name,
    description: group.description ?? "",
    branchId: group.branchId,
  };

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Grupos", href: "/gestao/grupos" },
          { title: group.name, href: `/gestao/grupos/${id}` },
          { title: "Editar" },
        ]}
      />

      <GroupForm
        defaultValues={defaultValues}
        isEditing
        redirectTo="/gestao/grupos"
      />
    </div>
  );
}
