'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/features/users/users.hooks';
import {
  useUserPostsQuery,
  useUserProfileQuery,
} from '@/features/users/users-profile.hooks';

function formatPostDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function UserProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);

  const profileQuery = useUserProfileQuery(username);
  const postsQuery = useUserPostsQuery(username);

  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const profile = profileQuery.data?.data;
  const posts = postsQuery.data?.data.posts ?? [];

  const isFollowPending =
    followMutation.isPending || unfollowMutation.isPending;

  function handleFollowToggle() {
    if (!profile || isFollowPending || profile.isMe) return;

    if (profile.isFollowing) {
      unfollowMutation.mutate(profile.username, {
        onSuccess: () => profileQuery.refetch(),
      });
    } else {
      followMutation.mutate(profile.username, {
        onSuccess: () => profileQuery.refetch(),
      });
    }
  }

  if (profileQuery.isPending) {
    return (
      <main className='min-h-screen bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-950 dark:text-white'>
        <div className='mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900'>
          Memuat profil pengguna...
        </div>
      </main>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <main className='min-h-screen bg-gray-50 px-4 py-10 text-gray-900 dark:bg-gray-950 dark:text-white'>
        <div className='mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900'>
          <h1 className='text-lg font-semibold'>Profil tidak dapat dimuat</h1>
          <p className='mt-2 text-sm text-gray-500'>
            Pengguna mungkin tidak ditemukan atau terjadi masalah koneksi.
          </p>
          <Link
            href='/'
            className='mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700'
          >
            Kembali ke Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-white'>
      <div className='mx-auto max-w-3xl space-y-6'>
        <header className='flex items-center justify-between'>
          <Link href='/' className='text-xl font-bold text-blue-600'>
            Sociality
          </Link>
          <Link
            href='/'
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
          >
            Kembali ke Home
          </Link>
        </header>

        <section className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`Avatar ${profile.name || profile.username}`}
                width={112}
                height={112}
                unoptimized
                className='size-24 rounded-full object-cover sm:size-28'
              />
            ) : (
              <div className='flex size-24 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 sm:size-28'>
                {(profile.name || profile.username).charAt(0).toUpperCase()}
              </div>
            )}

            <div className='min-w-0 flex-1'>
              <h1 className='text-2xl font-bold'>
                {profile.name || profile.username}
              </h1>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                @{profile.username}
              </p>

              {profile.bio && (
                <p className='mt-4 whitespace-pre-wrap text-sm leading-6'>
                  {profile.bio}
                </p>
              )}

              {!profile.isMe && (
                <button
                  type='button'
                  onClick={handleFollowToggle}
                  disabled={isFollowPending}
                  className={`mt-4 rounded-lg px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    profile.isFollowing
                      ? 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowPending
                    ? 'Memproses...'
                    : profile.isFollowing
                      ? 'Following'
                      : 'Follow'}
                </button>
              )}

              {(followMutation.isError || unfollowMutation.isError) && (
                <p role='alert' className='mt-2 text-sm text-red-600'>
                  Gagal memperbarui status Follow. Silakan coba lagi.
                </p>
              )}
            </div>
          </div>

          <div className='mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 dark:border-gray-800 sm:grid-cols-4'>
            <div className='text-center'>
              <p className='text-xl font-bold'>{profile.counts.post}</p>
              <p className='mt-1 text-sm text-gray-500'>Postingan</p>
            </div>
            <div className='text-center'>
              <p className='text-xl font-bold'>{profile.counts.followers}</p>
              <p className='mt-1 text-sm text-gray-500'>Followers</p>
            </div>
            <div className='text-center'>
              <p className='text-xl font-bold'>{profile.counts.following}</p>
              <p className='mt-1 text-sm text-gray-500'>Following</p>
            </div>
            <div className='text-center'>
              <p className='text-xl font-bold'>{profile.counts.likes}</p>
              <p className='mt-1 text-sm text-gray-500'>Likes</p>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold'>Postingan</h2>
            {postsQuery.data && (
              <span className='text-sm text-gray-500'>
                {postsQuery.data.data.pagination.total} postingan
              </span>
            )}
          </div>

          {postsQuery.isPending && (
            <div className='rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900'>
              Memuat postingan...
            </div>
          )}

          {postsQuery.isError && (
            <div className='rounded-xl border border-red-200 bg-white p-6 dark:border-red-900 dark:bg-gray-900'>
              <p className='text-sm text-red-600'>
                Gagal memuat postingan pengguna.
              </p>
              <button
                type='button'
                onClick={() => postsQuery.refetch()}
                className='mt-3 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800'
              >
                Coba lagi
              </button>
            </div>
          )}

          {postsQuery.isSuccess && posts.length === 0 && (
            <div className='rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900'>
              <p className='font-medium'>Belum ada postingan</p>
              <p className='mt-1 text-sm text-gray-500'>
                Postingan pengguna ini akan muncul di sini.
              </p>
            </div>
          )}

          {postsQuery.isSuccess && posts.length > 0 && (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {posts.map((post) => (
                <article
                  key={post.id}
                  className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900'
                >
                  {post.imageUrl ? (
                    <div className='relative aspect-square bg-gray-100 dark:bg-gray-800'>
                      <Image
                        src={post.imageUrl}
                        alt={`Gambar postingan ${profile.username}`}
                        fill
                        unoptimized
                        className='object-cover'
                        sizes='(max-width: 640px) 100vw, 50vw'
                      />
                    </div>
                  ) : (
                    <div className='flex aspect-square items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-gray-800'>
                      Tidak ada gambar
                    </div>
                  )}

                  <div className='space-y-3 p-4'>
                    <time
                      dateTime={post.createdAt}
                      className='block text-xs text-gray-500 dark:text-gray-400'
                    >
                      {formatPostDate(post.createdAt)}
                    </time>

                    <p className='whitespace-pre-wrap break-words text-sm leading-6'>
                      {post.caption}
                    </p>

                    <div className='flex items-center gap-4 border-t border-gray-100 pt-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400'>
                      <span aria-label={`${post.likeCount} likes`}>
                        ♥ {post.likeCount} Likes
                      </span>
                      <span>☰ {post.commentCount} Komentar</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
