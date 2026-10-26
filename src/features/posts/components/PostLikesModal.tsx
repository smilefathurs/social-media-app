'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/lib/redux/hooks';
import { useInfinitePostLikesQuery } from '../posts.hooks';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/features/users/users.hooks';

interface PostLikesModalProps {
  postId: number;
  onClose: () => void;
}

export default function PostLikesModal({
  postId,
  onClose,
}: PostLikesModalProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const likesQuery = useInfinitePostLikesQuery(postId);
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const users = likesQuery.data?.pages.flatMap((page) => page.data.users) ?? [];

  const pagination =
    likesQuery.data?.pages[likesQuery.data.pages.length - 1]?.data.pagination;

  const isFollowPending =
    followMutation.isPending || unfollowMutation.isPending;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleFollowToggle(username: string, isFollowing: boolean) {
    if (!isAuthenticated || isFollowPending) return;

    const options = {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['post-likes', postId],
          }),
          queryClient.invalidateQueries({
            queryKey: ['users'],
          }),
        ]);
      },
    };

    if (isFollowing) {
      unfollowMutation.mutate(username, options);
    } else {
      followMutation.mutate(username, options);
    }
  }

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-end justify-center bg-black/70 text-white'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role='dialog'
        aria-modal='true'
        aria-labelledby='post-likes-title'
        className='relative mx-auto flex max-h-[70dvh] w-full max-w-[548px] flex-col text-white sm:max-h-[min(530px,65dvh)]'
      >
        <div className='relative mx-auto flex max-h-[70dvh] min-h-0 w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-[#181D27] bg-[#0A0D12] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[min(530px,65dvh)] sm:rounded-2xl sm:border-b sm:p-5'>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close likes'
            className='absolute right-3 top-3 z-20 flex size-9 cursor-pointer items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white'
          >
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              className='size-5'
              aria-hidden='true'
            >
              <path d='m18 6-12 12M6 6l12 12' />
            </svg>
          </button>
          <h2
            id='post-likes-title'
            className='mb-5 shrink-0 pr-10 text-base font-semibold'
          >
            Likes
            {pagination && (
              <span className='ml-2 text-sm font-normal text-white/45'>
                {pagination.total}
              </span>
            )}
          </h2>

          <div className='min-h-0 flex-1 space-y-5 overflow-y-auto pr-6 [scrollbar-color:#414651_#0A0D12] [scrollbar-width:thin]'>
            {likesQuery.isPending && (
              <p className='py-8 text-center text-sm text-white/50'>
                Loading users...
              </p>
            )}

            {likesQuery.isError && (
              <div className='py-6 text-center'>
                <p className='text-sm text-red-400'>
                  Failed to load likes.
                </p>
                <button
                  type='button'
                  onClick={() => likesQuery.refetch()}
                  className='mt-3 text-sm text-purple-300 hover:text-purple-200'
                >
                  Try Again
                </button>
              </div>
            )}

            {!likesQuery.isPending &&
              !likesQuery.isError &&
              users.length === 0 && (
                <p className='py-8 text-center text-sm text-white/50'>
                  No one has liked this post yet.
                </p>
              )}

            {users.map((user) => (
              <div key={user.id} className='flex items-center gap-3'>
                <Link
                  href={`/users/${encodeURIComponent(user.username)}`}
                  onClick={onClose}
                  className='shrink-0'
                  aria-label={`View profile of ${user.name || user.username}`}
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=''
                      width={44}
                      height={44}
                      unoptimized
                      className='size-11 rounded-full border border-white/10 object-cover'
                    />
                  ) : (
                    <div className='flex size-11 items-center justify-center rounded-full bg-white/10 font-semibold'>
                      {(user.name || user.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className='min-w-0 flex-1'>
                  <Link
                    href={`/users/${encodeURIComponent(user.username)}`}
                    onClick={onClose}
                    className='block truncate text-sm font-semibold hover:text-purple-300'
                  >
                    {user.name || user.username}
                  </Link>
                  <p className='truncate text-xs text-white/45'>
                    @{user.username}
                  </p>
                </div>

                {!user.isMe && isAuthenticated && (
                  <button
                    type='button'
                    disabled={isFollowPending}
                    onClick={() =>
                      handleFollowToggle(user.username, user.isFollowedByMe)
                    }
                    className={
                      user.isFollowedByMe
                        ? 'shrink-0 cursor-pointer rounded-full border border-[#414651] px-4 py-2 text-xs font-medium transition hover:bg-white/10 disabled:opacity-50'
                        : 'shrink-0 cursor-pointer rounded-full bg-[#155EEF] px-4 py-2 text-xs font-medium transition hover:bg-[#1849A9] disabled:opacity-50'
                    }
                  >
                    {user.isFollowedByMe ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))}

            {likesQuery.hasNextPage && (
              <button
                type='button'
                disabled={likesQuery.isFetchingNextPage}
                onClick={() => likesQuery.fetchNextPage()}
                className='w-full cursor-pointer rounded-lg py-3 text-sm font-medium text-purple-300 hover:bg-white/5 disabled:opacity-50'
              >
                {likesQuery.isFetchingNextPage ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
