import { CalendarDays, CheckCircle, Clock, DollarSign, StickyNote } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cookieConst } from "@/constants/cookies";
import type { PaymentRequestStatus } from "@/constants/payment-request-status";
import { PAYMENT_REQUEST_STATUS_COLORS, PAYMENT_REQUEST_STATUS_LABELS } from "@/constants/payment-request-status";
import type { WorkShiftSlotStatus } from "@/constants/work-shift-slot-status";
import { WORK_SHIFT_SLOT_STATUS_COLORS, WORK_SHIFT_SLOT_STATUS_LABELS } from "@/constants/work-shift-slot-status";
import { cn } from "@/lib/cn";
import { usersService } from "@/modules/users/users-service";

// --- Mocked data ---

const MOCK_SHIFT_SUMMARY: { status: WorkShiftSlotStatus; count: number }[] = [
  { status: "CONFIRMED", count: 10 },
  { status: "CHECKED_IN", count: 5 },
  { status: "INVITED", count: 4 },
  { status: "COMPLETED", count: 3 },
  { status: "OPEN", count: 1 },
  { status: "ABSENT", count: 1 },
];

const MOCK_FINANCIAL: { status: PaymentRequestStatus; count: number; amount: number }[] = [
  { status: "NEW", count: 12, amount: 3_840.0 },
  { status: "APPROVED", count: 8, amount: 2_560.0 },
  { status: "PAID", count: 45, amount: 14_400.0 },
  { status: "REJECTED", count: 3, amount: 960.0 },
];

const MOCK_NOTES = [
  { title: "Entregador João relatou problema no app", time: "Há 30 min", priority: "high" as const },
  { title: "Cliente Mercado Central pediu aumento de turnos", time: "Há 2 horas", priority: "medium" as const },
  { title: "Atualização de contrato Farmácia Bem Estar", time: "Há 5 horas", priority: "low" as const },
];

const PRIORITY_COLORS = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};

const STAT_CARDS = [
  {
    label: "Turnos hoje",
    value: "24",
    icon: CalendarDays,
    accent: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    label: "Confirmados",
    value: "18",
    icon: CheckCircle,
    accent: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    label: "Pendentes financeiro",
    value: "5",
    icon: DollarSign,
    accent: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
  },
  {
    label: "Anotações",
    value: "3",
    icon: StickyNote,
    accent: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950",
  },
];

// --- Helpers ---

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatDate(): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getFirstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

// --- Page ---

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(cookieConst.USER_ID)?.value;

  if (!userId) redirect("/login");

  const userResult = await usersService().getById(userId);
  if (userResult.isErr() || !userResult.value) redirect("/login");

  const userName = getFirstName(userResult.value.name);
  const totalFinancial = MOCK_FINANCIAL.reduce((sum, row) => sum + row.amount, 0);
  const totalShifts = MOCK_SHIFT_SUMMARY.reduce((sum, row) => sum + row.count, 0);

  return (
    <main className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-muted-foreground capitalize">{formatDate()}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <Card key={card.label} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-normal">{card.label}</span>
                <span className={cn("rounded-md p-1.5", card.bg)}>
                  <card.icon className={cn("size-4", card.accent)} />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Work-shift status summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" />
              Status dos turnos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_SHIFT_SUMMARY.map((row) => (
              <div key={row.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={cn(WORK_SHIFT_SLOT_STATUS_COLORS[row.status])}>
                    {WORK_SHIFT_SLOT_STATUS_LABELS[row.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", WORK_SHIFT_SLOT_STATUS_COLORS[row.status])}
                      style={{ width: `${(row.count / totalShifts) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm font-medium">{row.count}</span>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-bold">{totalShifts}</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial resume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-4" />
              Resumo financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_FINANCIAL.map((row) => (
              <div key={row.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={cn(PAYMENT_REQUEST_STATUS_COLORS[row.status])}>
                    {PAYMENT_REQUEST_STATUS_LABELS[row.status]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">({row.count})</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(row.amount)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-bold">{formatCurrency(totalFinancial)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="size-4" />
              Anotações recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_NOTES.map((note) => (
              <div key={note.title} className="flex items-start gap-3 rounded-lg border px-3 py-2.5">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", PRIORITY_COLORS[note.priority])} />
                <div className="flex-1">
                  <p className="text-sm">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{note.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
