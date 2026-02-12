import { ContentHeader } from "@/components/composite/content-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DetalheRegiaoLoading() {
  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Regiões", href: "/gestao/regioes" },
          { title: "..." },
        ]}
      />

      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>

      <Skeleton className="h-4 w-96" />
    </div>
  );
}
