import { Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { regionsService } from "@/lib/modules/regions/regions-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function RegionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserLogged();
  const canViewRegions = checkUserPermissions(user, ["manager.view"]);

  if (!canViewRegions) {
    return redirect("/app/sem-permissao");
  }

  const region = await regionsService().getById(id);

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Regiões",
            href: "/app/gestao/regiao",
          },
          {
            title: region.name || "Detalhes da Região",
          },
        ]}
      />
      <main className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Heading variant="h2" className="mb-0">
            {region.name}
          </Heading>
          <Button asChild>
            <Link href={`/app/gestao/regiao/${region.id}/editar`}>
              <Pencil className="mr-2 size-4" />
              Editar
            </Link>
          </Button>
        </div>

        <section className="space-y-2">
          <Text variant="base">
            {region.description?.trim() || "Sem descrição disponível."}
          </Text>
        </section>

        <section className="space-y-3">
          <Heading variant="h3" className="mb-0">
            Clientes
          </Heading>
          {region.clients?.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {region.clients.map((client) => (
                <li key={client.id}>
                  <Text variant="base" className="mb-0">
                    {client.name}
                  </Text>
                </li>
              ))}
            </ul>
          ) : (
            <Text variant="muted">Nenhum cliente associado.</Text>
          )}
        </section>

        <section className="space-y-3">
          <Heading variant="h3" className="mb-0">
            Entregadores
          </Heading>
          {region.deliverymans?.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {region.deliverymans.map((deliveryman) => (
                <li key={deliveryman.id}>
                  <Text variant="base" className="mb-0">
                    {deliveryman.name}
                  </Text>
                </li>
              ))}
            </ul>
          ) : (
            <Text variant="muted">Nenhum entregador associado.</Text>
          )}
        </section>
      </main>
    </>
  );
}
