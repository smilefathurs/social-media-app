'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import PostCard from '@/features/posts/components/PostCard';
import { useInfiniteLikedPostsQuery } from '@/features/posts/posts.hooks';

export default function LikedPostsPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const likedPostsQuery = useInfiniteLikedPostsQuery(isAuthenticated);
  const likedPosts = likedPostsQuery.data?.pages.flatMap((page) => page.data.posts) ?? [];
  const totalPosts = likedPostsQuery.data?.pages[0]?.data.pagination.total ?? 0;

  return (
    <main className='min-h-screen bg-black px-4 pb-28 pt-5 text-white sm:pt-8'>
      <div className='mx-auto w-full max-w-[600px] space-y-6'>
        <header className='sticky top-0 z-40 -mx-4 flex items-center justify-between gap-4 border-b border-white/10 bg-black/90 px-4 py-4 backdrop-blur-xl'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Liked Posts ({totalPosts})</h1>
            <p className='mt-1 text-sm text-white/45'>
              Posts you've liked and want to find again.
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
            <p>Log in to view posts you've liked.</p>
            <Link
              href='/login'
              className='mt-4 inline-flex cursor-pointer rounded-full bg-purple-600 px-5 py-2 font-semibold text-white transition hover:bg-purple-500'
            >
              Login
            </Link>
          </div>
        )}

        {isAuthenticated && likedPostsQuery.isPending && (
          <p className='rounded-2xl border border-white/10 bg-[#111014] py-8 text-center text-white/50'>
            Loading liked posts...
          </p>
        )}

        {isAuthenticated && likedPostsQuery.isError && (
          <div className='rounded-2xl border border-red-500/20 bg-[#111014] p-5 text-red-400'>
            <p>Failed to load liked posts.</p>
            <button
              type='button'
              onClick={() => likedPostsQuery.refetch()}
              className='mt-3 cursor-pointer rounded-full bg-purple-600 px-5 py-2 text-white transition hover:bg-purple-500'
            >
              Try Again
            </button>
          </div>
        )}

        {isAuthenticated && likedPostsQuery.isSuccess && (
          likedPosts.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-white/15 bg-[#111014] p-8 text-center'>
              <h2 className='font-semibold'>
                No Liked Posts Yet
              </h2>
              <p className='mt-2 text-sm text-white/45'>
                Like posts in your Home Feed to find them here.
              </p>
              <Link
                href='/'
                className='mt-4 inline-flex cursor-pointer rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-500'
              >
                Explore Home Feed
              </Link>
            </div>
          ) : (
            <div className='space-y-5'>
              {likedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  metadataLabel='Liked at'
                />
              ))}

              {likedPostsQuery.hasNextPage && (
                <div className='flex justify-center pt-2'>
                  <button
                    type='button'
                    onClick={() => likedPostsQuery.fetchNextPage()}
                    disabled={likedPostsQuery.isFetchingNextPage}
                    className='cursor-pointer rounded-full border border-white/10 bg-[#17151d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    {likedPostsQuery.isFetchingNextPage ? 'Loading...' : 'Load More'}
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

