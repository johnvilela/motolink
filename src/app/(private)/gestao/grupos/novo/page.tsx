import { cookies } from "next/headers";
import { ContentHeader } from "@/components/composite/content-header";
import { GroupForm } from "@/components/forms/group-form";
import { cookieConst } from "@/constants/cookies";
import { getCurrentUser } from "@/modules/users/users-queries";
import requirePermissions from "@/utils/require-permissions";

export default async function NovoGrupoPage() {
  const store = await cookies();
  const branchId = store.get(cookieConst.SELECTED_BRANCH)?.value;

  const currentUser = await getCurrentUser();
  requirePermissions(currentUser, ["groups.create"], "Grupos");

  return (
    <div className="space-y-4">
      <ContentHeader
        breadcrumbItems={[
          { title: "Gestão", href: "/gestao" },
          { title: "Grupos", href: "/gestao/grupos" },
          { title: "Novo Grupo" },
        ]}
      />

      <GroupForm branchId={branchId} redirectTo="/gestao/grupos" />
    </div>
  );
}
