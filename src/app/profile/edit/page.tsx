'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import SocialityNavbar from '@/components/SocialityNavbar';
import ProfileBottomNav from '@/components/ProfileBottomNav';
import EditProfilePageForm from '@/features/users/components/EditProfilePageForm';
import { useUserProfileQuery } from '@/features/users/users-profile.hooks';

function BackIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      className='size-6'
    >
      <path d='m15 18-6-6 6-6' />
    </svg>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const profileQuery = useUserProfileQuery(user?.username ?? '', Boolean(user));
  const profile = profileQuery.data?.data;

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <main className='min-h-screen bg-[#0d0b11] text-white'>
        <p className='p-6 text-sm text-white/60'>Memuat sesi pengguna...</p>
      </main>
    );
  }

  if (profileQuery.isPending) {
    return (
      <main className='min-h-screen bg-[#0d0b11] px-4 py-10 text-white'>
        <p className='mx-auto max-w-5xl text-sm text-white/60'>
          Memuat profil...
        </p>
      </main>
    );
  }

  if (profileQuery.isError || !profile || !profile.isMe) {
    return (
      <main className='min-h-screen bg-[#0d0b11] px-4 py-10 text-white'>
        <div className='mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#17151d] p-6'>
          <h1 className='text-lg font-semibold'>Profil tidak dapat dimuat</h1>
          <p className='mt-2 text-sm text-white/60'>
            Silakan periksa koneksi dan sesi login, lalu coba lagi.
          </p>
          <button
            type='button'
            onClick={() => profileQuery.refetch()}
            className='mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500'
          >
            Coba Lagi
          </button>
          <Link
            href={`/users/${encodeURIComponent(user.username)}`}
            className='ml-3 inline-flex text-sm text-purple-300 hover:text-purple-200'
          >
            Kembali ke Profil
          </Link>
        </div>
      </main>
    );
  }

  const profileHref = `/users/${encodeURIComponent(user.username)}`;

  return (
    <main className='min-h-screen overflow-x-hidden bg-[#0d0b11] pb-28 text-white sm:pb-12'>
      <div className='hidden sm:block'>
        <SocialityNavbar />
      </div>

      <header className='sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0d0b11]/95 px-4 backdrop-blur-xl sm:hidden'>
        <Link
          href={profileHref}
          aria-label='Kembali ke profil'
          className='flex size-10 items-center justify-center text-white/85'
        >
          <BackIcon />
        </Link>

        <h1 className='text-base font-semibold'>Edit Profile</h1>

        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=''
            width={36}
            height={36}
            unoptimized
            className='size-9 rounded-full object-cover'
          />
        ) : (
          <span className='flex size-9 items-center justify-center rounded-full bg-purple-500/20 font-semibold text-purple-300'>
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </header>

      <div className='mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10'>
        <div className='mb-8 hidden items-center gap-3 sm:flex'>
          <Link
            href={profileHref}
            aria-label='Kembali ke profil'
            className='flex size-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10'
          >
            <BackIcon />
          </Link>
          <h1 className='text-2xl font-semibold'>Edit Profile</h1>
        </div>

        <section className='rounded-2xl border border-white/[0.06] bg-[#17151d] p-5 sm:p-8'>
          <EditProfilePageForm key={profile.username} profile={profile} />
        </section>
      </div>

      <div className='sm:hidden'>
        <ProfileBottomNav active='profile' />
      </div>
    </main>
  );
}
