import { Pencil } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppContentHeader } from "@/components/ui/app-layout/app-content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cepMask } from "@/lib/masks/cep-mask";
import { cnpjMask } from "@/lib/masks/cnpj-mask";
import { clientsService } from "@/lib/modules/clients/clients-service";
import { getUserLogged } from "@/lib/modules/users/users-actions";
import { checkUserPermissions } from "@/lib/utils/check-user-permissions";

const formatDate = (value: Date | string) =>
  new Intl.DateTimeFormat("pt-BR").format(new Date(value));

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loggedUser = await getUserLogged();
  const canViewClients = checkUserPermissions(loggedUser, ["manager.view"]);

  if (!canViewClients) {
    return redirect("/app/sem-permissao");
  }

  const client = await clientsService()
    .getById(id)
    .catch(() => null);

  if (!client) {
    return <div>Cliente não encontrado</div>;
  }

  const canEditClient = checkUserPermissions(loggedUser, ["manager.edit"]);

  return (
    <>
      <AppContentHeader
        breadcrumbItems={[
          {
            title: "Clientes",
            href: "/app/clientes",
          },
          {
            title: client.name || "Detalhes do Cliente",
          },
        ]}
      />
      <main className="container mx-auto py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Heading variant="h2" className="mb-0">
            {client.name}
          </Heading>
          {canEditClient ? (
            <Button asChild>
              <Link href={`/app/clientes/${client.id}/editar`}>
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
            </Button>
          ) : null}
        </div>

        <section className="space-y-4">
          <Heading variant="h3" className="mb-0">
            Informações gerais
          </Heading>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Text variant="muted">Nome</Text>
              <Text variant="large">{client.name}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">CNPJ</Text>
              <Text variant="large">
                {client.cnpj ? cnpjMask(client.cnpj) : "—"}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Contato</Text>
              <Text variant="large">{client.contactName || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Região</Text>
              <Text variant="large">{client.region?.name || "Sem região"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Grupo</Text>
              <Text variant="large">{client.group?.name || "Sem grupo"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Cadastrado em</Text>
              <Text variant="large">
                {client.createdAt ? formatDate(client.createdAt) : "—"}
              </Text>
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <Heading variant="h3" className="mb-0">
            Endereço
          </Heading>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <Text variant="muted">CEP</Text>
              <Text variant="large">
                {client.cep ? cepMask(client.cep) : "—"}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Rua</Text>
              <Text variant="large">{client.street || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Número</Text>
              <Text variant="large">{client.number || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Complemento</Text>
              <Text variant="large">{client.complement || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Bairro</Text>
              <Text variant="large">{client.neighborhood || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">Cidade</Text>
              <Text variant="large">{client.city || "—"}</Text>
            </div>
            <div className="space-y-1">
              <Text variant="muted">UF</Text>
              <Text variant="large">{client.uf || "—"}</Text>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
