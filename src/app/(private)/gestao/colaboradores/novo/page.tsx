import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { UserForm } from "@/components/forms/user-form";
import { branchesService } from "@/modules/branches/branches-service";
import { checkPagePermission } from "@/utils/check-page-permission";

export default async function NovoColaboradorPage() {
  if (!(await checkPagePermission("users.create"))) return <AccessDenied />;
  const branchesResult = await branchesService().listAll({
    page: 1,
    pageSize: 100,
  });

  const branches = branchesResult.isOk() ? branchesResult.value.data : [];

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <ContentHeader
        breadcrumbItems={[{ title: "Colaboradores", href: "/gestao/colaboradores" }, { title: "Novo Colaborador" }]}
      />
      <UserForm branches={branches} redirectTo="/gestao/colaboradores" />
    </main>
  );
}
