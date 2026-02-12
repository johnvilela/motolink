import { ContentHeader } from "@/components/composite/content-header";
import { UserForm } from "@/components/forms/user-form";
import { branchesService } from "@/modules/branches/branches-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import requirePermissions from "@/utils/require-permissions";

export default async function NovoColaboradorPage() {
  const currentUser = await getCurrentUser();

  requirePermissions(currentUser, ["users.create"], "Colaboradores");
  const branches = await branchesService().getAll();

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Colaboradores", href: "/gestao/colaboradores" },
          { title: "Novo Colaborador" },
        ]}
      />

      <UserForm branches={branches} redirectTo="/gestao/colaboradores" />
    </div>
  );
}
