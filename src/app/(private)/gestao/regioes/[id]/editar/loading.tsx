import { ContentHeader } from "@/components/composite/content-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditarRegiaoLoading() {
  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Regiões", href: "/gestao/regioes" },
          { title: "...", href: "#" },
          { title: "Editar" },
        ]}
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        <div className="flex md:justify-end">
          <Skeleton className="h-9 w-full md:w-36" />
        </div>
      </div>
    </div>
  );
}
