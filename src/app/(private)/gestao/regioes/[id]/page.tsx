import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/composite/content-header";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { regionsService } from "@/modules/regions/regions-service";

interface DetalheRegiaoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalheRegiaoPage({
  params,
}: DetalheRegiaoPageProps) {
  const { id } = await params;

  const region = await regionsService().getById(id);

  if (!region) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Regiões", href: "/gestao/regioes" },
          { title: region.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <Heading variant="h3">{region.name}</Heading>
        <Button variant="outline" asChild>
          <Link href={`/gestao/regioes/${id}/editar`}>
            <PencilIcon />
            Editar
          </Link>
        </Button>
      </div>

      {region.description ? (
        <Text>{region.description}</Text>
      ) : (
        <Text variant="muted">Nenhuma descrição informada.</Text>
      )}
    </div>
  );
}
