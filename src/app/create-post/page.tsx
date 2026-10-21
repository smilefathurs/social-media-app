'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import CreatePostForm from '@/features/posts/components/CreatePostForm';
import SocialityNavbar from '@/components/SocialityNavbar';

function ArrowLeftIcon() {
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
      <path d='m15 18-6-6 6-6' />
      <path d='M9 12h12' />
    </svg>
  );
}

export default function CreatePostPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-black px-4 text-white'>
        <section className='w-full max-w-md rounded-2xl border border-white/10 bg-[#111016] p-6 text-center'>
          <h1 className='text-xl font-bold'>Login diperlukan</h1>
          <p className='mt-2 text-sm leading-6 text-white/55'>
            Silakan login untuk membuat postingan di Sociality.
          </p>
          <Link
            href='/login'
            className='mt-5 inline-flex rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500'
          >
            Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-black px-4 pb-12 text-white'>
      <SocialityNavbar />

      <div className='mx-auto w-full max-w-[600px] pt-8 sm:pt-12'>
        <button
          type='button'
          onClick={() => router.push('/')}
          className='mb-6 inline-flex cursor-pointer items-center gap-2 text-sm text-white/60 transition hover:text-purple-300'
        >
          <ArrowLeftIcon />
          Kembali ke Timeline
        </button>

        <div className='mb-6'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-purple-300'>
            Create Post
          </p>
          <h1 className='mt-2 text-2xl font-bold tracking-tight sm:text-3xl'>
            Bagikan ceritamu
          </h1>
          <p className='mt-2 text-sm leading-6 text-white/50'>
            Abadikan momen dan bagikan dengan komunitas Sociality.
          </p>
        </div>

        <div className='w-full'>
          <CreatePostForm />
        </div>
      </div>
    </main>
  );
}
