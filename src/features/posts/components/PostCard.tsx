'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  useDeletePostMutation,
  useLikeMutation,
  useUnlikeMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useSavedPostsQuery,
} from '../posts.hooks';
import { useAppSelector } from '@/lib/redux/hooks';
import type { Post } from '../posts.types';
import PostComments from './PostComments';

interface PostCardProps {
  post: Post;
}

function formatPostDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function PostCard({ post }: PostCardProps) {
  const authorName = post.author.name || post.author.username;
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const deleteMutation = useDeletePostMutation();

  const isOwner = user?.id === post.author.id;

  function handleDeletePost() {
    if (!isOwner || deleteMutation.isPending) return;

    const confirmed = window.confirm(
      'Apakah kamu yakin ingin menghapus postingan ini?'
    );

    if (confirmed) {
      deleteMutation.mutate(post.id);
    }
  }

  const likeMutation = useLikeMutation();
  const unlikeMutation = useUnlikeMutation();
  const isLikePending = likeMutation.isPending || unlikeMutation.isPending;

  function handleLikeToggle() {
    if (isLikePending) return;

    if (post.likedByMe) {
      unlikeMutation.mutate(post.id);
    } else {
      likeMutation.mutate(post.id);
    }
  }

  const saveMutation = useSavePostMutation();
  const unsaveMutation = useUnsavePostMutation();

  const isSavePending = saveMutation.isPending || unsaveMutation.isPending;

  const savedPostsQuery = useSavedPostsQuery();

  const isSaved =
    savedPostsQuery.data?.data?.posts?.some(
      (savedPost) => savedPost.id === post.id
    ) ?? false;

  function handleSaveToggle() {
    if (isSavePending) return;

    if (isSaved) {
      unsaveMutation.mutate(post.id);
    } else {
      saveMutation.mutate(post.id);
    }
  }

  return (
    <article className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900'>
      <div className='flex items-center gap-3 p-4'>
        <Link
          href={`/users/${encodeURIComponent(post.author.username)}`}
          className='shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
          aria-label={`Lihat profil ${authorName}`}
        >
          {post.author.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt={`Avatar ${authorName}`}
              width={44}
              height={44}
              unoptimized
              className='size-11 rounded-full object-cover'
            />
          ) : (
            <div className='flex size-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className='min-w-0 flex-1'>
          <Link
            href={`/users/${encodeURIComponent(post.author.username)}`}
            className='block truncate text-sm font-semibold hover:text-blue-600 dark:hover:text-blue-400'
          >
            {authorName}
          </Link>

          <Link
            href={`/users/${encodeURIComponent(post.author.username)}`}
            className='block truncate text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
          >
            @{post.author.username}
          </Link>

          <time
            dateTime={post.createdAt}
            className='text-xs text-gray-500 dark:text-gray-400'
          >
            {formatPostDate(post.createdAt)}
          </time>
        </div>
        {isOwner && (
          <button
            type='button'
            onClick={handleDeletePost}
            disabled={deleteMutation.isPending}
            className='rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950'
          >
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </button>
        )}
      </div>

      {post.caption && (
        <p className='whitespace-pre-wrap break-words px-4 pb-4 text-sm leading-6'>
          {post.caption}
        </p>
      )}

      {post.imageUrl && (
        <div className='relative flex max-h-[600px] justify-center overflow-hidden bg-gray-100 dark:bg-gray-950'>
          <Image
            src={post.imageUrl}
            alt={`Postingan oleh ${authorName}`}
            width={1200}
            height={1200}
            unoptimized
            className='h-auto max-h-[600px] w-full object-contain'
          />
        </div>
      )}

      <div className='flex flex-wrap items-center gap-5 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400'>
        <button
          type='button'
          onClick={handleLikeToggle}
          disabled={isLikePending}
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? 'Batalkan suka' : 'Sukai postingan'}
          className={`inline-flex items-center gap-2 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            post.likedByMe
              ? 'font-semibold text-red-600 dark:text-red-400'
              : 'hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          <span aria-hidden='true'>{post.likedByMe ? '[LIKED]' : '[LIKE]'}</span>
          <span>
            {isLikePending
              ? 'Memproses...'
              : post.likedByMe
                ? 'Disukai'
                : 'Suka'}
          </span>
          <span>{post.likeCount}</span>
        </button>

        <button
          type='button'
          onClick={() => setIsCommentsOpen((previous) => !previous)}
          aria-expanded={isCommentsOpen}
          aria-controls={`post-comments-${post.id}`}
          className='inline-flex items-center gap-2 rounded-md transition-colors hover:text-blue-600 dark:hover:text-blue-400'
        >
          <span aria-hidden='true'>[COMMENT]</span>
          <span>{post.commentCount} komentar</span>
          <span aria-hidden='true'>{isCommentsOpen ? '[-]' : '[+]'}</span>
        </button>

        <button
          type='button'
          onClick={handleSaveToggle}
          disabled={isSavePending}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Hapus dari Saved Posts' : 'Simpan postingan'}
          className={`inline-flex items-center gap-2 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isSaved
              ? 'font-semibold text-blue-600 dark:text-blue-400'
              : 'hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          <span aria-hidden='true'>{isSaved ? '[SAVED]' : '[SAVE]'}</span>
          <span>
            {isSavePending ? 'Memproses...' : isSaved ? 'Tersimpan' : 'Simpan'}
          </span>
        </button>
      </div>

      {(likeMutation.isError || unlikeMutation.isError) && (
        <p
          role='alert'
          className='px-4 pb-3 text-sm text-red-600 dark:text-red-400'
        >
          Gagal memperbarui Like. Silakan coba lagi.
        </p>
      )}

      {(saveMutation.isError || unsaveMutation.isError) && (
        <p
          role='alert'
          className='px-4 pb-3 text-sm text-red-600 dark:text-red-400'
        >
          Gagal menyimpan perubahan. Silakan coba lagi.
        </p>
      )}

      {deleteMutation.isError && (
        <p
          role='alert'
          className='px-4 pb-3 text-sm text-red-600 dark:text-red-400'
        >
          Gagal menghapus postingan. Silakan coba lagi.
        </p>
      )}

      {isCommentsOpen && (
        <div id={`post-comments-${post.id}`}>
          <PostComments postId={post.id} />
        </div>
      )}
    </article>
  );
}
