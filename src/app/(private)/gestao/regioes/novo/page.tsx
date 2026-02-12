import { ContentHeader } from "@/components/composite/content-header";
import { RegionForm } from "@/components/forms/region-form";

export default function NovaRegiaoPage() {
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
