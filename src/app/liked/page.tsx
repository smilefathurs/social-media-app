'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { useLikedPostsQuery } from '@/features/posts/posts.hooks';

export default function LikedPostsPage() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const likedPostsQuery = useLikedPostsQuery(
    { page: 1, limit: 20 },
    isAuthenticated
  );

  return (
    <main className='min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-white'>
      <div className='mx-auto max-w-2xl space-y-6'>
        <header className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Liked Posts</h1>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Kumpulan postingan yang kamu sukai.
            </p>
          </div>

          <Link
            href='/'
            className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
          >
            Kembali
          </Link>
        </header>

        {!isAuthenticated && (
          <div className='rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900'>
            <p>Login untuk melihat postingan yang kamu sukai.</p>
            <Link
              href='/login'
              className='mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700'
            >
              Login
            </Link>
          </div>
        )}

        {isAuthenticated && likedPostsQuery.isPending && (
          <p className='py-8 text-center text-gray-500'>
            Memuat Liked Posts...
          </p>
        )}

        {isAuthenticated && likedPostsQuery.isError && (
          <div className='rounded-xl border border-red-200 p-4 text-red-600 dark:border-red-900'>
            <p>Gagal memuat Liked Posts.</p>
            <button
              type='button'
              onClick={() => likedPostsQuery.refetch()}
              className='mt-3 rounded-lg bg-blue-600 px-4 py-2 text-white'
            >
              Coba lagi
            </button>
          </div>
        )}

        {isAuthenticated &&
          likedPostsQuery.isSuccess &&
          (likedPostsQuery.data.data.posts.length === 0 ? (
            <div className='rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900'>
              <h2 className='font-semibold'>
                Belum ada postingan yang disukai
              </h2>
              <p className='mt-2 text-sm text-gray-500'>
                Berikan Like pada postingan di Home Feed untuk menemukannya
                kembali di sini.
              </p>
              <Link
                href='/'
                className='mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
              >
                Buka Home Feed
              </Link>
            </div>
          ) : (
            <div className='space-y-5'>
              {likedPostsQuery.data.data.posts.map((post) => (
                <article
                  key={post.id}
                  className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900'
                >
                  {post.imageUrl && (
                    <div className='relative aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800'>
                      <Image
                        src={post.imageUrl}
                        alt='Gambar postingan yang disukai'
                        fill
                        unoptimized
                        className='object-contain'
                        sizes='(max-width: 672px) 100vw, 672px'
                      />
                    </div>
                  )}

                  <div className='space-y-3 p-4'>
                    <Link
                      href={`/users/${encodeURIComponent(post.author.username)}`}
                      className='text-sm font-semibold text-purple-600 hover:underline dark:text-purple-400'
                    >
                      {post.author.name} @{post.author.username}
                    </Link>

                    <p className='whitespace-pre-wrap break-words'>
                      {post.caption}
                    </p>

                    <div className='flex items-center justify-between gap-3 text-xs text-gray-500'>
                      <span>♥ {post.likeCount} Likes</span>
                      <span>
                        {new Intl.DateTimeFormat('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(post.createdAt))}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
      </div>
    </main>
  );
}
