import { Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { groupsService } from "@/lib/modules/groups/groups-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

export default async function GroupDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserLogged();
  const canViewGroups = checkUserPermissions(user, ["manager.view"]);

  if (!canViewGroups) {
    return redirect("/app/sem-permissao");
  }

  const group = await groupsService().getById(id);

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Gestão de Grupos",
            href: "/app/gestao/grupos",
          },
          {
            title: group.name || "Detalhes do Grupo",
          },
        ]}
      />
      <main className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Heading variant="h2" className="mb-0">
            {group.name}
          </Heading>
          <Button asChild>
            <Link href={`/app/gestao/grupos/${group.id}/editar`}>
              <Pencil className="mr-2 size-4" />
              Editar
            </Link>
          </Button>
        </div>

        <section className="space-y-2">
          <Text variant="base">
            {group.description?.trim() || "Sem descrição disponível."}
          </Text>
        </section>

        <section className="space-y-3">
          <Heading variant="h3" className="mb-0">
            Clientes
          </Heading>
          {group.clients?.length ? (
            <ul className="list-disc space-y-1 pl-5">
              {group.clients.map((client) => (
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
      </main>
    </>
  );
}
