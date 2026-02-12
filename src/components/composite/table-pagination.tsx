import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  currentSearch?: string;
}

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 1) return [1];

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("ellipsis");

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) items.push("ellipsis");

  items.push(totalPages);

  return items;
}

function createPageHref(page: number, pageSize: number, search?: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (search) params.set("search", search);
  return `?${params.toString()}`;
}

export function TablePagination({
  page,
  pageSize,
  totalPages,
  currentSearch,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = buildPageItems(page, totalPages);
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={
              page > 1 ? createPageHref(prevPage, pageSize, currentSearch) : "#"
            }
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : 0}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>

        {pageItems.map((item, index) => (
          /* biome-ignore lint/suspicious/noArrayIndexKey: using combined item and index for a stable key in this pagination list */
          <PaginationItem key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={createPageHref(item, pageSize, currentSearch)}
                isActive={item === page}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={
              page < totalPages
                ? createPageHref(nextPage, pageSize, currentSearch)
                : "#"
            }
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : 0}
            className={
              page >= totalPages ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
