import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { GroupForm } from "@/components/forms/group-form";
import { checkPagePermission } from "@/utils/check-page-permission";

export default async function NovoGrupoPage() {
  if (!(await checkPagePermission("groups.create"))) return <AccessDenied />;
  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <ContentHeader breadcrumbItems={[{ title: "Grupos", href: "/gestao/grupos" }, { title: "Novo Grupo" }]} />
      <GroupForm redirectTo="/gestao/grupos" />
    </main>
  );
}
