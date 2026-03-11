import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

interface AppContentHeaderProps {
  breadcrumbItems?: { title: string; href?: string }[];
}

export function ContentHeader({ breadcrumbItems = [] }: AppContentHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return [
              <BreadcrumbItem key={item.href ?? index} className={isLast ? undefined : "hidden md:block"}>
                {isLast ? (
                  <BreadcrumbPage>{item.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href ?? "/dashboard"}>{item.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>,
              !isLast && (
                <BreadcrumbSeparator
                  key={`sep-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: Nesse caso o index é suficiente
                    index
                  }`}
                  className="hidden md:block"
                />
              ),
            ];
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
