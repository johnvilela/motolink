import { AppLayoutWrapper } from "@/components/ui/app-layout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutWrapper>{children}</AppLayoutWrapper>;
}
