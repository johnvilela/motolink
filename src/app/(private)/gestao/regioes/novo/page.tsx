import { AccessDenied } from "@/components/composite/access-denied";
import { ContentHeader } from "@/components/composite/content-header";
import { RegionForm } from "@/components/forms/region-form";
import { checkPagePermission } from "@/utils/check-page-permission";

export default async function NovaRegiaoPage() {
  if (!(await checkPagePermission("regions.create"))) return <AccessDenied />;
  return (
    <main className="mx-auto max-w-6xl space-y-6 py-6">
      <ContentHeader breadcrumbItems={[{ title: "Regiões", href: "/gestao/regioes" }, { title: "Nova Região" }]} />
      <RegionForm redirectTo="/gestao/regioes" />
    </main>
  );
}
