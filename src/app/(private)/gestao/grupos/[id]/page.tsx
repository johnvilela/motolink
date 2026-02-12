import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { groupsService } from "@/modules/groups/groups-service";

interface DetalheGrupoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalheGrupoPage({
  params,
}: DetalheGrupoPageProps) {
  const { id } = await params;

  const group = await groupsService().getById(id);

  if (!group) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Grupos", href: "/gestao/grupos" },
          { title: group.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <Heading variant="h3">{group.name}</Heading>
        <Button variant="outline" asChild>
          <Link href={`/gestao/grupos/${id}/editar`}>
            <PencilIcon />
            Editar
          </Link>
        </Button>
      </div>

      {group.description ? (
        <Text>{group.description}</Text>
      ) : (
        <Text variant="muted">Nenhuma descrição informada.</Text>
      )}
    </div>
  );
}
