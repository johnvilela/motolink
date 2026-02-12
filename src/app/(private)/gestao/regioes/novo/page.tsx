import { ContentHeader } from "@/components/composite/content-header";
import { RegionForm } from "@/components/forms/region-form";
import { getCurrentUser } from "@/modules/users/users-queries";
import requirePermissions from "@/utils/require-permissions";

export default async function NovaRegiaoPage() {
  const currentUser = await getCurrentUser();

  requirePermissions(currentUser, ["regions.create"], "Regiões");

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Regiões", href: "/gestao/regioes" },
          { title: "Nova Região" },
        ]}
      />

      <RegionForm redirectTo="/gestao/regioes" />
    </div>
  );
}
