'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchUsersQuery } from '../users.hooks';

interface UserSearchProps {
  onClose?: () => void;
}

function SearchIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      className={className}
      aria-hidden='true'
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
  );
}

function ClearIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' className='size-4' aria-hidden='true'>
      <circle cx='12' cy='12' r='10' fill='currentColor' />
      <path
        d='m9 9 6 6m0-6-6 6'
        stroke='#111016'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      className='size-8'
      aria-hidden='true'
    >
      <path d='m18 6-12 12M6 6l12 12' />
    </svg>
  );
}

export default function UserSearch({ onClose }: UserSearchProps) {
  const [searchInput, setSearchInput] = useState('');

  const query = searchInput.trim();
  const usersQuery = useSearchUsersQuery(
    { q: query, page: 1, limit: 20 },
    query.length > 0,
  );

  const users = usersQuery.data?.data.users ?? [];
  const hasQuery = query.length > 0;

  function clearSearch() {
    setSearchInput('');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function renderSearchForm(mobile = false) {
    return (
      <form
        onSubmit={handleSubmit}
        role='search'
        className={`flex items-center gap-3 rounded-full border border-white/10 bg-[#0A0D12] transition focus-within:border-purple-500/60 ${
          mobile
            ? 'h-20 flex-1 px-6'
            : 'h-12 w-full px-4'
        }`}
      >
        <SearchIcon
          className={
            mobile
              ? 'size-8 shrink-0 text-white/45'
              : 'size-5 shrink-0 text-white/45'
          }
        />

        <input
          type='search'
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder='Search'
          aria-label='Search by name or username'
          autoComplete='off'
          autoFocus={mobile}
          className={`min-w-0 flex-1 appearance-none bg-transparent text-white outline-none placeholder:text-white/45 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
            mobile ? 'text-2xl' : 'text-sm'
          }`}
        />

        {hasQuery && (
          <button
            type='button'
            onClick={clearSearch}
            aria-label='Clear search'
            className='shrink-0 cursor-pointer text-white/50 transition hover:text-white'
          >
            <ClearIcon />
          </button>
        )}
      </form>
    );
  }

  function renderSearchResults(mobile = false) {
    if (!hasQuery) return null;

    if (usersQuery.isPending || usersQuery.isFetching) {
      return (
        <p
          role='status'
          className={
            mobile
              ? 'px-4 py-8 text-center text-base text-white/50'
              : 'px-4 py-8 text-center text-sm text-white/50'
          }
        >
          Searching...
        </p>
      );
    }

    if (usersQuery.isError) {
      return (
        <div className='px-4 py-8 text-center'>
          <p role='alert' className='text-sm text-red-400'>
            Failed to search users.
          </p>
          <button
            type='button'
            onClick={() => usersQuery.refetch()}
            className='mt-3 text-sm text-purple-300 hover:text-purple-200'
          >
            Try again
          </button>
        </div>
      );
    }

    if (users.length === 0) {
      return mobile ? (
        <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center'>
          <h2 className='text-3xl font-bold text-white'>
            No results found
          </h2>
          <p className='mt-7 text-2xl text-white/60'>
            Change your keyword
          </p>
        </div>
      ) : (
        <div className='px-4 py-16 text-center'>
          <h2 className='text-base font-semibold text-white'>
            No results found
          </h2>
          <p className='mt-3 text-sm text-white/60'>
            Change your keyword
          </p>
        </div>
      );
    }

    return (
      <div className={mobile ? 'space-y-1 pb-6' : 'space-y-1 p-4'}>
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/users/${encodeURIComponent(user.username)}`}
            onClick={onClose}
            className={`flex min-w-0 items-center rounded-xl transition hover:bg-white/[0.06] ${
              mobile ? 'gap-4 px-0 py-4' : 'gap-3 px-1 py-2.5'
            }`}
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=''
                width={mobile ? 96 : 48}
                height={mobile ? 96 : 48}
                unoptimized
                className={`shrink-0 rounded-full object-cover ${
                  mobile ? 'size-24' : 'size-12'
                }`}
              />
            ) : (
              <span
                className={`flex shrink-0 items-center justify-center rounded-full bg-purple-500/15 font-semibold text-purple-300 ${
                  mobile ? 'size-24 text-3xl' : 'size-12 text-base'
                }`}
              >
                {(user.name || user.username).charAt(0).toUpperCase()}
              </span>
            )}

            <span className='min-w-0 flex-1'>
              <span
                className={`block truncate font-semibold text-white ${
                  mobile ? 'text-2xl' : 'text-sm'
                }`}
              >
                {user.name || user.username}
              </span>
              <span
                className={`mt-1 block truncate text-white/60 ${
                  mobile ? 'text-2xl' : 'text-sm'
                }`}
              >
                {user.username}
              </span>
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop search dropdown */}
      <section className='relative hidden w-full min-w-0 sm:block'>
        {renderSearchForm()}

        {hasQuery && (
          <div className='absolute inset-x-0 top-full z-[60] mt-3 max-h-[min(65vh,480px)] overflow-y-auto [scrollbar-color:#414651_#0A0D12] [scrollbar-width:thin] rounded-3xl border border-white/10 bg-[#0A0D12] shadow-2xl shadow-black/50'>
            {renderSearchResults()}
          </div>
        )}
      </section>

      {/* Mobile fullscreen search */}
      <section className='fixed inset-0 z-[100] bg-black text-white sm:hidden'>
        <div className='flex items-center gap-4 border-b border-white/10 px-4 py-6'>
          {renderSearchForm(true)}
          <button
            type='button'
            onClick={onClose}
            aria-label='Close search'
            className='shrink-0 cursor-pointer text-white transition hover:text-purple-300'
          >
            <CloseIcon />
          </button>
        </div>

        <div className='relative max-h-[calc(100dvh-112px)] overflow-y-auto [scrollbar-color:#414651_#0A0D12] [scrollbar-width:thin] px-4'>
          {renderSearchResults(true)}
        </div>
      </section>
    </>
  );
}
