'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import UserSearch from '@/features/users/components/UserSearch';
import { useLogoutMutation } from '@/features/auth/auth-logout.hooks';
function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill={active ? 'currentColor' : 'none'}
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-5'
      aria-hidden='true'
    >
      <path d='m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z' />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      className='size-6'
      aria-hidden='true'
    >
      <path d='M12 5v14M5 12h14' />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='size-5'
      aria-hidden='true'
    >
      <circle cx='12' cy='8' r='4' />
      <path d='M4 21a8 8 0 0 1 16 0' />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      className='size-5'
      aria-hidden='true'
    >
      <circle cx='11' cy='11' r='7' />
      <path d='m20 20-4-4' />
    </svg>
  );
}


export default function SocialityNavbar({ showPostSuccess = false }: { showPostSuccess?: boolean }) {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const logoutMutation = useLogoutMutation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        event.target instanceof Node &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProfileMenuOpen]);

  const profileHref = user?.username
    ? `/users/${encodeURIComponent(user.username)}`
    : '/login';

  return (
    <>
      {/* Header */}
      <header className='sticky top-0 z-40 border-b border-white/[0.08] bg-black/90 backdrop-blur-xl'>
        <div className='mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'>
          <Link
            href='/'
            className='flex shrink-0 items-center gap-2.5'
            aria-label='Sociality Home'
          >
            <Image
              src='/images/sociality-logo.png'
              alt=''
              width={44}
              height={44}
              priority
              className='size-10 shrink-0 object-contain'
            />
            <span className='text-xl font-bold tracking-tight text-white'>
              Sociality
            </span>
          </Link>

          {/* Searchbox desktop */}
          <div className='absolute left-1/2 hidden w-[491px] max-w-[calc(100%-32px)] -translate-x-1/2 sm:block'>
            <UserSearch />
          </div>

          {/* Header desktop */}
          <div className='hidden items-center gap-4 sm:flex'>
            {isAuthenticated ? (
              <div ref={profileMenuRef} className='relative'>
                <button
                  type='button'
                  onClick={() => setIsProfileMenuOpen((previous) => !previous)}
                  aria-label='Buka menu profil'
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup='menu'
                  className='flex max-w-52 items-center gap-2 rounded-full border cursor-pointer border-white/1 py-1.5 pl-1.5 pr-3 transition hover:border-purple-400/40 hover:bg-white/[0.04]'
                >
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=''
                      width={32}
                      height={32}
                      unoptimized
                      className='size-8 rounded-full object-cover'
                    />
                  ) : (
                    <span className='flex size-8 items-center justify-center rounded-full bg-purple-500/20 text-sm font-semibold text-purple-300'>
                      {(user?.name || user?.username || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}

                  <span className='truncate text-sm font-medium text-white/80'>
                    {user?.name ?? user?.username}
                  </span>

                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className={`size-4 shrink-0 text-white/50 transition-transform ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden='true'
                  >
                    <path d='m6 9 6 6 6-6' />
                  </svg>
                </button>

                {showPostSuccess && (
                  <div
                    role='status'
                    aria-live='polite'
                    className='absolute right-0 top-full z-[100] mt-2 flex h-10 w-[291px] items-center gap-2 rounded-lg bg-[#079455] px-3 py-2 text-sm font-semibold tracking-[-0.02em] text-white shadow-xl shadow-black/20'
                  >
                    <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15'>
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        className='size-3.5'
                        aria-hidden='true'
                      >
                        <path
                          d='m5 12 4 4L19 6'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </span>
                    <span className='flex-1'>Success Post</span>
                    <button
                      type='button'
                      onClick={() => {
                        const closeEvent = new CustomEvent('sociality:close-post-toast');
                        window.dispatchEvent(closeEvent);
                      }}
                      aria-label='Tutup notifikasi'
                      className='ml-auto flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-white/90 transition hover:bg-white/15 hover:text-white'
                    >
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        className='size-4'
                        aria-hidden='true'
                      >
                        <path d='M18 6 6 18M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                )}
                {isProfileMenuOpen && (
                  <div
                    role='menu'
                    className='absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#111016] p-2 shadow-2xl shadow-black/50'
                  >
                    <div className='border-b border-white/[0.00] px-3 py-3'>
                      <p className='truncate text-sm font-semibold text-white'>
                        {user?.name ?? user?.username}
                      </p>
                      <p className='mt-1 truncate text-xs text-white/45'>
                        @{user?.username}
                      </p>
                    </div>

                    <Link
                      href={profileHref}
                      role='menuitem'
                      onClick={() => setIsProfileMenuOpen(false)}
                      className='mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-purple-500/10 hover:text-purple-300'
                    >
                      <UserIcon />
                      Profile
                    </Link>

                    <Link
                      href='/create-post'
                      role='menuitem'
                      onClick={() => setIsProfileMenuOpen(false)}
                      className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 transition hover:bg-purple-500/10 hover:text-purple-300'
                    >
                      <PlusIcon />
                      Create Post
                    </Link>

                    <button
                      type='button'
                      role='menuitem'
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className='flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <svg
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='size-5'
                        aria-hidden='true'
                      >
                        <path d='M10 17l5-5-5-5M15 12H3' />
                        <path d='M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6' />
                      </svg>
                      {logoutMutation.isPending ? 'Sedang keluar...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href='/login'
                  className='rounded-full border border-white/15 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-purple-400/50 hover:text-white'
                >
                  Login
                </Link>
                <Link
                  href='/register'
                  className='rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-500'
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Header mobile */}
          <div className='flex items-center gap-3 sm:hidden'>
            <button
              type='button'
              onClick={() => setIsSearchOpen((previous) => !previous)}
              aria-label={isSearchOpen ? 'Tutup pencarian' : 'Buka pencarian'}
              aria-expanded={isSearchOpen}
              className='rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-purple-300'
            >
              <SearchIcon />
            </button>
            {isAuthenticated && user?.username ? (
              <Link
                href={profileHref}
                aria-label='Lihat profil'
                className='rounded-full ring-offset-2 ring-offset-black transition hover:ring-2 hover:ring-purple-500'
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt='Foto profil'
                    width={36}
                    height={36}
                    unoptimized
                    className='size-9 rounded-full object-cover'
                  />
                ) : (
                  <span className='flex size-9 items-center justify-center rounded-full bg-purple-500/20 font-semibold text-purple-300'>
                    {(user.name || user.username).charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <button
                type='button'
                onClick={() => setIsMenuOpen((previous) => !previous)}
                aria-label={isMenuOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={isMenuOpen}
                className='rounded-lg p-2 text-white/80 transition hover:bg-white/10'
              >
                {isMenuOpen ? (
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    className='size-6'
                    aria-hidden='true'
                  >
                    <path d='m18 6-12 12M6 6l12 12' />
                  </svg>
                ) : (
                  <svg
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    className='size-6'
                    aria-hidden='true'
                  >
                    <path d='M4 6h16M4 12h16M4 18h16' />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Menu dropdown mobile */}
        {isMenuOpen && !isAuthenticated && (
          <div className='border-t border-white/10 bg-[#0c0b10] px-4 py-4 sm:hidden'>
            <div className='mx-auto flex max-w-[600px] gap-3'>
              <Link
                href='/login'
                onClick={() => setIsMenuOpen(false)}
                className='flex-1 rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-white/[0.06]'
              >
                Login
              </Link>
              <Link
                href='/register'
                onClick={() => setIsMenuOpen(false)}
                className='flex-1 rounded-xl bg-purple-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-purple-500'
              >
                Register
              </Link>
            </div>
          </div>
        )}
        {isSearchOpen && (
          <div className='border-t border-white/10 bg-[#0c0b10] px-4 py-4 sm:hidden'>
            <div className='mx-auto max-w-[600px]'>
              <UserSearch />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
