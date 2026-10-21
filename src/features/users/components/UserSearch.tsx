'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  useFollowUserMutation,
  useSearchUsersQuery,
  useUnfollowUserMutation,
} from '../users.hooks';

export default function UserSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const usersQuery = useSearchUsersQuery(
    { q: searchTerm, page: 1, limit: 20 },
    searchTerm.length > 0
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
    <section className='relative w-full min-w-0'>
      <form
        onSubmit={handleSearch}
        role='search'
        className='flex h-11 w-full items-center gap-3 rounded-full border border-white/10 bg-[#17151d] px-4 transition focus-within:border-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/10'
      >
        <svg
          aria-hidden='true'
          viewBox='0 0 24 24'
          fill='none'
          className='size-5 shrink-0 text-white/45'
        >
          <circle
            cx='10.8'
            cy='10.8'
            r='6.8'
            stroke='currentColor'
            strokeWidth='1.8'
          />
          <path
            d='m16 16 4 4'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
          />
        </svg>

        <input
          type='search'
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder='Cari pengguna...'
          aria-label='Cari nama atau username'
          className='min-w-0 flex-1 appearance-none bg-transparent text-sm text-white outline-none placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden'
        />

        {searchInput && (
          <button
            type='button'
            onClick={() => {
              setSearchInput('');
              setSearchTerm('');
            }}
            aria-label='Hapus pencarian'
            className='shrink-0 cursor-pointer text-white/45 transition hover:text-white'
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              className='size-4'
              aria-hidden='true'
            >
              <path
                d='m6 6 12 12M18 6 6 18'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinecap='round'
              />
            </svg>
          </button>
        )}

      </form>

      {searchTerm && (
        <div className='absolute inset-x-0 top-full z-50 mt-3 max-h-[min(65vh,480px)] overflow-y-auto rounded-2xl border border-white/10 bg-[#111016] p-4 shadow-2xl shadow-black/40'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <h2 className='text-sm font-semibold text-white'>
              Hasil pencarian
            </h2>
            {!usersQuery.isFetching && usersQuery.isSuccess && (
              <span className='text-xs text-white/40'>
                {users.length} pengguna
              </span>
            )}
          </div>

          {usersQuery.isFetching && (
            <p className='py-4 text-sm text-white/50'>Mencari pengguna...</p>
          )}

          {usersQuery.isError && (
            <p role='alert' className='py-3 text-sm text-red-400'>
              Gagal mencari pengguna. Silakan coba lagi.
            </p>
          )}

          {mutationError && (
            <p role='alert' className='mb-3 text-sm text-red-400'>
              Gagal memperbarui status Follow. Silakan coba lagi.
            </p>
          )}

          {usersQuery.isSuccess && !usersQuery.isFetching && (
            <>
              {users.length === 0 ? (
                <p className='py-4 text-sm text-white/50'>
                  Tidak ada pengguna yang ditemukan.
                </p>
              ) : (
                <div className='space-y-3'>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className='flex items-center gap-3 border-t border-white/[0.07] pt-3 first:border-0 first:pt-0'
                    >
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={`Avatar ${user.name || user.username}`}
                          width={40}
                          height={40}
                          unoptimized
                          className='size-10 shrink-0 rounded-full object-cover'
                        />
                      ) : (
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/15 font-semibold text-purple-300'>
                          {(user.name || user.username).charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-white'>
                          {user.name || user.username}
                        </p>
                        <p className='truncate text-xs text-white/45'>
                          @{user.username}
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={() =>
                          handleFollowToggle(user.username, user.isFollowedByMe)
                        }
                        disabled={isFollowPending}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.isFollowedByMe
                            ? 'border border-white/15 text-white/70 hover:bg-white/10'
                            : 'bg-purple-600 text-white hover:bg-purple-500'
                        }`}
                      >
                        {user.isFollowedByMe ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
