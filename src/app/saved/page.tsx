'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { useInfiniteSavedPostsQuery } from '@/features/posts/posts.hooks';
import SavedPostCard from '@/features/posts/components/SavedPostCard';

export default function SavedPostsPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const savedPostsQuery = useInfiniteSavedPostsQuery(isAuthenticated);
  const savedPosts = savedPostsQuery.data?.pages.flatMap((page) => page.data.posts) ?? [];
  const totalPosts = savedPostsQuery.data?.pages[0]?.data.pagination.total ?? 0;

  return (
    <main className='min-h-screen bg-black px-4 pb-28 pt-5 text-white sm:pt-8'>
      <div className='mx-auto w-full max-w-[600px] space-y-6'>
        <header className='sticky top-0 z-40 -mx-4 flex items-center justify-between gap-4 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur-xl'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Saved Posts ({totalPosts})</h1>
            <p className='mt-1 text-sm text-white/45'>
              Posts you've saved to revisit anytime.
            </p>
          </div>
          <Link
            href='/'
            className='cursor-pointer rounded-full border border-white/10 bg-[#111014] px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white'
          >
            Back
          </Link>
        </header>

        {!isAuthenticated && (
          <div className='rounded-2xl border border-white/10 bg-[#111014] p-6 text-center'>
            <p>Login untuk melihat postingan yang kamu simpan.</p>
            <Link
              href='/login'
              className='mt-4 inline-flex cursor-pointer rounded-full bg-purple-600 px-5 py-2 font-semibold text-white transition hover:bg-purple-500'
            >
              Login
            </Link>
          </div>
        )}

        {isAuthenticated && savedPostsQuery.isPending && (
          <p className='rounded-2xl border border-white/10 bg-[#111014] py-8 text-center text-white/50'>
            Memuat Saved Posts...
          </p>
        )}

        {isAuthenticated && savedPostsQuery.isError && (
          <div className='rounded-2xl border border-red-500/20 bg-[#111014] p-5 text-red-400'>
            <p>Gagal memuat Saved Posts.</p>
            <button
              type='button'
              onClick={() => savedPostsQuery.refetch()}
              className='mt-3 cursor-pointer rounded-full bg-purple-600 px-5 py-2 text-white transition hover:bg-purple-500'
            >
              Coba lagi
            </button>
          </div>
        )}

        {isAuthenticated && savedPostsQuery.isSuccess && (
          savedPosts.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-white/15 bg-[#111014] p-8 text-center'>
              <h2 className='font-semibold'>Belum ada postingan tersimpan</h2>
              <p className='mt-2 text-sm text-white/45'>
                Simpan postingan dari Home Feed untuk melihatnya di sini.
              </p>
              <Link
                href='/'
                className='mt-4 inline-flex cursor-pointer rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-500'
              >
                Buka Home Feed
              </Link>
            </div>
          ) : (
            <div className='space-y-5'>
              {savedPosts.map((post) => (
                <SavedPostCard key={post.id} post={post} />
              ))}

              {savedPostsQuery.hasNextPage && (
                <div className='flex justify-center pt-2'>
                  <button
                    type='button'
                    onClick={() => savedPostsQuery.fetchNextPage()}
                    disabled={savedPostsQuery.isFetchingNextPage}
                    className='cursor-pointer rounded-full border border-white/10 bg-[#17151d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {savedPostsQuery.isFetchingNextPage ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </main>
  );
}

