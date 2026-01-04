export default function NoPermissionPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Acesso Negado</h1>
      <p className="text-center text-gray-600">
        Você não possui permissão para acessar esse recurso.
      </p>
    </div>
  );
}
