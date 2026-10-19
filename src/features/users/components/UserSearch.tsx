"use client";

import { useState } from "react";
import Image from "next/image";
import {
  useFollowUserMutation,
  useSearchUsersQuery,
  useUnfollowUserMutation,
} from "../users.hooks";

export default function UserSearch() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const usersQuery = useSearchUsersQuery(
    { q: searchTerm, page: 1, limit: 20 },
    searchTerm.length > 0,
  );

  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const isFollowPending =
    followMutation.isPending || unfollowMutation.isPending;

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchTerm(searchInput.trim());
  }

  function handleFollowToggle(username: string, isFollowed: boolean) {
    if (isFollowPending) return;

    if (isFollowed) {
      unfollowMutation.mutate(username);
    } else {
      followMutation.mutate(username);
    }
  }

  const users = usersQuery.data?.data.users ?? [];
  const mutationError = followMutation.isError || unfollowMutation.isError;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-3 text-lg font-semibold">Cari Pengguna</h2>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Cari nama atau username..."
          aria-label="Cari nama atau username"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={!searchInput.trim() || usersQuery.isFetching}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cari
        </button>
      </form>

      {usersQuery.isFetching && (
        <p className="mt-4 text-sm text-gray-500">Mencari pengguna...</p>
      )}

      {usersQuery.isError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          Gagal mencari pengguna. Silakan coba lagi.
        </p>
      )}

      {mutationError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          Gagal memperbarui status Follow. Silakan coba lagi.
        </p>
      )}

      {usersQuery.isSuccess && !usersQuery.isFetching && (
        <div className="mt-4 space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">
              Tidak ada pengguna yang ditemukan.
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 border-t border-gray-100 pt-3 first:border-0 first:pt-0 dark:border-gray-800"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={`Avatar ${user.name || user.username}`}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {(user.name || user.username).charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {user.name || user.username}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleFollowToggle(user.username, user.isFollowedByMe)
                  }
                  disabled={isFollowPending}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    user.isFollowedByMe
                      ? "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {user.isFollowedByMe ? "Following" : "Follow"}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {!searchTerm && (
        <p className="mt-4 text-sm text-gray-500">
          Masukkan nama atau username untuk mulai mencari.
        </p>
      )}
    </section>
  );
}
