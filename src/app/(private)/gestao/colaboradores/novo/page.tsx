import { ContentHeader } from "@/components/composite/content-header";
import { UserForm } from "@/components/forms/user-form";
import { branchesService } from "@/modules/branches/branches-service";

export default async function NovoColaboradorPage() {
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
