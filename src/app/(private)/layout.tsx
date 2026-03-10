import { AppLayout } from "@/components/composite/app-layout";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
