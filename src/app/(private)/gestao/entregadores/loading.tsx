import { ContentHeader } from "@/components/composite/content-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function EntregadoresLoading() {
  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Entregadores" },
        ]}
      />

      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="rounded-md border">
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Only used for loading state
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="ml-auto h-6 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Skeleton className="h-9 w-64" />
      </div>
    </div>
  );
}
