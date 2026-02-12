import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { UserForm } from "@/components/forms/user-form";
import { branchesService } from "@/modules/branches/branches-service";
import { getCurrentUser } from "@/modules/users/users-queries";
import { usersService } from "@/modules/users/users-service";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";
import requirePermissions from "@/utils/require-permissions";

interface EditarColaboradorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarColaboradorPage({
  params,
}: EditarColaboradorPageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["users.edit"], "Colaboradores");

  const [user, branches] = await Promise.all([
    usersService().getById(id),
    branchesService().getAll(),
  ]);

  if (!user) {
    notFound();
  }

  const defaultValues = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ? applyPhoneMask(user.phone) : "",
    document: user.document ? applyCpfMask(user.document) : "",
    birthDate: user.birthDate ? dayjs(user.birthDate).format("DD/MM/YYYY") : "",
    role: user.role,
    permissions: user.permissions,
    branches: user.branches,
    files: user.files as string[],
  };

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Colaboradores", href: "/gestao/colaboradores" },
          { title: user.name, href: `/gestao/colaboradores/${id}` },
          { title: "Editar" },
        ]}
      />

      <UserForm
        branches={branches}
        defaultValues={defaultValues}
        isEditing
        redirectTo="/gestao/colaboradores"
      />
    </div>
  );
}
