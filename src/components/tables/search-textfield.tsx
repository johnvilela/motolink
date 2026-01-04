"use client";

import { CircleX, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type ComponentProps, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Textfield } from "../ui/textfield";

interface SearchTextfieldProps extends ComponentProps<"input"> {
  placeholder?: string;
  baseUrl?: string;
}

export function SearchTextField({
  placeholder,
  baseUrl = "",
  ...props
}: SearchTextfieldProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  function searchFc() {
    console.log(`${baseUrl}?search=${search}`);
    router.push(`${baseUrl}?search=${search}`);
  }

  function clearFilters() {
    setSearch("");
    router.push(baseUrl);
  }

  useEffect(() => {
    const searchQuery = searchParams.get("search") || "";
    setSearch(searchQuery);
  }, [searchParams]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        searchFc();
      }}
      className="flex gap-2"
    >
      <Textfield
        id="search"
        placeholder={placeholder || "Buscar por ..."}
        divClassName="max-w-sm"
        icon={Search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        {...props}
      />
      <button type="submit" hidden />
      {search && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={clearFilters}
        >
          <CircleX />
        </Button>
      )}
    </form>
  );
}
