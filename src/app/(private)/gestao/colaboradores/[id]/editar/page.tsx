import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { UserForm } from "@/components/forms/user-form";
import { branchesService } from "@/modules/branches/branches-service";
import { usersService } from "@/modules/users/users-service";
import { checkPagePermission } from "@/utils/check-page-permission";
import { applyCpfMask } from "@/utils/masks/cpf-mask";
import { applyPhoneMask } from "@/utils/masks/phone-mask";

interface EditarColaboradorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarColaboradorPage({ params }: EditarColaboradorPageProps) {
  if (!(await checkPagePermission("users.edit"))) return <AccessDenied />;

  const { id } = await params;

  const [userResult, branchesResult] = await Promise.all([
    usersService().getById(id),
    branchesService().listAll({ page: 1, pageSize: 100 }),
  ]);

  if (userResult.isErr() || !userResult.value) {
    notFound();
  }

  const user = userResult.value;
  const branches = branchesResult.isOk() ? branchesResult.value.data : [];

  const defaultValues = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ? applyPhoneMask(user.phone) : "",
    document: user.document ? applyCpfMask(user.document) : "",
    birthDate: user.birthDate ? dayjs(user.birthDate).format("DD/MM/YYYY") : "",
    branches: user.branches,
    role: user.role,
    permissions: user.permissions,
    files: (user.files as string[]) ?? [],
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <ContentHeader
        breadcrumbItems={[
          { title: "Colaboradores", href: "/gestao/colaboradores" },
          { title: user.name, href: `/gestao/colaboradores/${id}` },
          { title: "Editar" },
        ]}
      />
      <UserForm
        branches={branches}
        defaultValues={defaultValues}
        isEditing
        redirectTo={`/gestao/colaboradores/${id}`}
      />
    </main>
  );
}
