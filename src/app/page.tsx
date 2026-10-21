'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { useFeedQuery } from '@/features/posts/posts.hooks';
import PostCard from '@/features/posts/components/PostCard';
import UserSearch from '@/features/users/components/UserSearch';
import { useLogoutMutation } from '@/features/auth/auth-logout.hooks';
import { useRouter } from 'next/navigation';
import SocialityNavbar from '@/components/SocialityNavbar';

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

export default function Home() {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const logoutMutation = useLogoutMutation();
  const feedQuery = useFeedQuery({ page: 1, limit: 20 }, isAuthenticated);
  const router = useRouter();

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

  function handleCreatePostNavigation() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    router.push('/create-post');
  }

  return (
    <main className='min-h-screen bg-black pb-28 text-white'>
      <SocialityNavbar />

      {/* Timeline */}
      <div className='mx-auto w-full max-w-[648px] px-4 pt-5 sm:px-6 sm:pt-8'>
        {!isAuthenticated && (
          <section className='mb-6 rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-950/50 via-[#111014] to-black p-5 sm:p-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-purple-300'>
              Welcome to Sociality
            </p>

            <h1 className='mt-3 text-2xl font-bold tracking-tight sm:text-3xl'>
              Ceritakan duniamu.
              <span className='block text-purple-400'>
                Terhubung lebih dekat.
              </span>
            </h1>

            <p className='mt-3 max-w-md text-sm leading-6 text-white/55'>
              Bergabunglah untuk berbagi momen, menemukan cerita, dan terhubung
              dengan komunitas.
            </p>

            <div className='mt-5 flex flex-wrap gap-3'>
              <Link
                href='/register'
                className='rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500'
              >
                Mulai sekarang
              </Link>
              <Link
                href='/login'
                className='rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]'
              >
                Login
              </Link>
            </div>
          </section>
        )}

        <section aria-label='Timeline postingan' className='space-y-5'>
          {isAuthenticated && feedQuery.isPending && (
            <div className='rounded-2xl border border-white/10 bg-[#111014] p-8 text-center'>
              <div className='mx-auto size-7 animate-spin rounded-full border-2 border-white/10 border-t-purple-500' />
              <p className='mt-4 text-sm text-white/50'>Memuat feed...</p>
            </div>
          )}

          {isAuthenticated && feedQuery.isError && (
            <div className='rounded-2xl border border-red-500/20 bg-[#111014] p-5'>
              <p className='font-semibold text-red-400'>Feed gagal dimuat.</p>
              <p className='mt-2 break-words text-sm text-white/50'>
                {feedQuery.error instanceof Error
                  ? feedQuery.error.message
                  : 'Terjadi kesalahan.'}
              </p>
              <button
                type='button'
                onClick={() => feedQuery.refetch()}
                className='mt-4 rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold transition hover:bg-purple-500'
              >
                Coba lagi
              </button>
            </div>
          )}

          {isAuthenticated &&
            feedQuery.isSuccess &&
            feedQuery.data.data.items.length === 0 && (
              <div className='rounded-2xl border border-dashed border-white/15 bg-[#111014] px-6 py-12 text-center'>
                <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-purple-500/10 text-purple-300'>
                  <PlusIcon />
                </div>
                <h2 className='mt-4 font-semibold'>Belum ada postingan</h2>
                <p className='mt-2 text-sm leading-6 text-white/45'>
                  Jadilah yang pertama berbagi cerita dengan komunitasmu.
                </p>
              </div>
            )}

          {isAuthenticated &&
            feedQuery.isSuccess &&
            feedQuery.data.data.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

          {!isAuthenticated && (
            <div className='rounded-2xl border border-white/10 bg-[#111014] px-6 py-10 text-center'>
              <div className='mx-auto flex size-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-300'>
                <HomeIcon active />
              </div>
              <h2 className='mt-4 font-semibold'>Feed komunitasmu menanti</h2>
              <p className='mx-auto mt-2 max-w-sm text-sm leading-6 text-white/45'>
                Login untuk melihat postingan dan berinteraksi dengan pengguna
                Sociality.
              </p>
              <Link
                href='/login'
                className='mt-5 inline-flex rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500'
              >
                Lihat feed
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Floating bottom navigation */}
      <nav
        aria-label='Navigasi utama'
        className='fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(240px,calc(100%-32px))] items-center justify-around rounded-full border border-white/10 bg-[#17151d]/95 px-3 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl'
      >
        <Link
          href='/'
          aria-label='Home'
          aria-current='page'
          className='flex size-11 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-950/40 transition hover:bg-purple-500'
        >
          <HomeIcon active />
        </Link>

        <button
          type='button'
          onClick={handleCreatePostNavigation}
          aria-label={
            isAuthenticated ? 'Buat postingan' : 'Login untuk membuat postingan'
          }
          className='flex size-11 cursor-pointer items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-950/40 transition hover:scale-105 hover:bg-purple-500'
        >
          <PlusIcon />
        </button>

        <Link
          href={profileHref}
          aria-label='Profile'
          className='flex size-11 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-purple-300'
        >
          <UserIcon />
        </Link>
      </nav>
    </main>
  );
}
