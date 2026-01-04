import { PAGE_SIZE } from "@/lib/constants/app";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

interface TablePaginationProps {
  totalCount: number;
  page?: number;
  baseUrl: string;
}
export function TablePagination({
  totalCount,
  page,
  baseUrl,
}: TablePaginationProps) {
  const currentPage = Number(page || "1");
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  let pagesList: Array<{ label: number; url: string }> = [];

  if (currentPage === 1) {
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pagesList.push({ label: i, url: `${baseUrl}?page=${i}` });
    }
  } else {
    pagesList = [
      {
        label: Number(currentPage) - 1,
        url: `${baseUrl}?page=${currentPage - 1}`,
      },
      { label: Number(currentPage), url: `${baseUrl}?page=${currentPage}` },
      {
        label: Math.min(Number(currentPage) + 1, totalPages),
        url: `${baseUrl}?page=${Math.min(currentPage + 1, totalPages)}`,
      },
    ];
  }

  if (totalCount <= PAGE_SIZE) {
    return <div></div>;
  }

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
        )}
        {pagesList.map((p) => (
          <PaginationItem key={p.url}>
            <PaginationLink href={p.url} isActive={currentPage === p.label}>
              {p.label}
            </PaginationLink>
          </PaginationItem>
        ))}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {currentPage === totalPages - 1 && (
          <PaginationItem>
            <PaginationNext href={`${baseUrl}?page=${currentPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
