"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "../../generated/prisma/client";
import { useMutation } from "./use-mutation";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [limit, setLimit] = useState(10);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const params = new URLSearchParams();
      params.append("limit", String(limit));
      if (cursor) params.append("cursor", cursor);
      if (search) params.append("search", search);

      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      setUsers(data.data);
      setTotalCount(data.count);
    } catch (_error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [limit, cursor, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const { mutate: deleteUserMutate, status: deleteUserStatus } = useMutation(
    () => {
      if (!userToDelete) return Promise.resolve();
      return fetch(`/api/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userToDelete }),
      });
    },
  );

  useEffect(() => {
    if (deleteUserStatus === "success") {
      fetchUsers();
      setUserToDelete(null);
    }
  }, [deleteUserStatus, fetchUsers]);

  const deleteUser = (id: string) => {
    setUserToDelete(id);
  };

  useEffect(() => {
    if (userToDelete) {
      deleteUserMutate();
    }
  }, [userToDelete, deleteUserMutate]);

  const handleNextPage = () => {
    if (users.length === limit) {
      setCursor(users[users.length - 1]?.id);
    }
  };

  const handlePreviousPage = () => {
    // A simple reset, as true "previous" is complex with cursor pagination
    setCursor(undefined);
  };

  return {
    users,
    totalCount,
    isLoading,
    isError,
    limit,
    setLimit,
    search,
    setSearch,
    handleNextPage,
    handlePreviousPage,
    deleteUser,
  };
}
