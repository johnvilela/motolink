import { statusConst } from "@/constants/status";

type Status = (typeof statusConst)[keyof typeof statusConst];

const statusConfig: Record<Status, { label: string; className: string }> = {
  [statusConst.ACTIVE]: {
    label: "Ativo",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  [statusConst.INACTIVE]: {
    label: "Inativo",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
  [statusConst.PENDING]: {
    label: "Pendente",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  [statusConst.BLOCKED]: {
    label: "Bloqueado",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status as Status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
