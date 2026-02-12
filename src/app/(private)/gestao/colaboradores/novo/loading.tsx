import { ContentHeader } from "@/components/composite/content-header";
import { Skeleton } from "@/components/ui/skeleton";

function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export default function NovoColaboradorLoading() {
  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Colaboradores", href: "/gestao/colaboradores" },
          { title: "Novo Colaborador" },
        ]}
      />

      <div className="space-y-8">
        <fieldset className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Only used for loading state
              <FormFieldSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="space-y-4">
            <FormFieldSkeleton />
            <FormFieldSkeleton />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </fieldset>

        <div className="flex md:justify-end">
          <Skeleton className="h-9 w-full md:w-36" />
        </div>
      </div>
    </div>
  );
}
