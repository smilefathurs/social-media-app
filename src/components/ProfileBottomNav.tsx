'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';

interface ProfileBottomNavProps {
  active?: 'home' | 'profile';
}

function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function UserIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export default function ProfileBottomNav({
  active = 'profile',
}: ProfileBottomNavProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const profileHref = user?.username
    ? `/users/${encodeURIComponent(user.username)}`
    : '/login';

  function handleCreatePost() {
    router.push(isAuthenticated ? '/create-post' : '/login');
  }

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[min(280px,calc(100%-32px))] items-center justify-around rounded-full border border-white/10 bg-[#17151d]/95 px-4 py-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:w-[min(240px,calc(100%-32px))] sm:py-2"
    >
      <Link
        href="/"
        aria-label="Home"
        aria-current={active === 'home' ? 'page' : undefined}
        className={`flex size-11 items-center justify-center rounded-full transition ${
          active === 'home'
            ? 'text-purple-400'
            : 'text-white/55 hover:text-purple-300'
        }`}
      >
        <HomeIcon active={active === 'home'} />
      </Link>

      <button
        type="button"
        onClick={handleCreatePost}
        aria-label={
          isAuthenticated ? 'Create post' : 'Log in to create a post'
        }
        className="flex size-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg shadow-purple-950/40 transition hover:scale-105 hover:bg-purple-500 sm:size-11"
      >
        <PlusIcon />
      </button>

      <Link
        href={profileHref}
        aria-label="Profile"
        aria-current={active === 'profile' ? 'page' : undefined}
        className={`flex size-11 items-center justify-center rounded-full transition ${
          active === 'profile'
            ? 'text-purple-400'
            : 'text-white/55 hover:text-purple-300'
        }`}
      >
        <UserIcon active={active === 'profile'} />
      </Link>
    </nav>
  );
}
