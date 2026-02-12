import { ContentHeader } from "@/components/composite/content-header";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DetalheColaboradorLoading() {
  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Colaboradores", href: "/gestao/colaboradores" },
          { title: "..." },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-28 rounded-full" />
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <Skeleton className="h-6 w-44" />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Only used for loading state
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="size-4" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Skeleton className="h-6 w-48" />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </section>
      </div>
    </div>
  );
}
