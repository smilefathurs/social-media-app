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

type IconName = 'heart' | 'message' | 'bookmark' | 'share' | 'more';

function Icon({
  name,
  filled = false,
  className = 'size-5',
}: {
  name: IconName;
  filled?: boolean;
  className?: string;
}) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'heart':
      return (
        <svg {...common}>
          <path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z' />
        </svg>
      );
    case 'message':
      return (
        <svg {...common}>
          <path d='M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z' />
        </svg>
      );
    case 'bookmark':
      return (
        <svg {...common}>
          <path d='M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z' />
        </svg>
      );
    case 'share':
      return (
        <svg {...common}>
          <circle cx='18' cy='5' r='3' />
          <circle cx='6' cy='12' r='3' />
          <circle cx='18' cy='19' r='3' />
          <path d='m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4' />
        </svg>
      );
    case 'more':
      return (
        <svg {...common}>
          <circle cx='5' cy='12' r='1' fill='currentColor' />
          <circle cx='12' cy='12' r='1' fill='currentColor' />
          <circle cx='19' cy='12' r='1' fill='currentColor' />
        </svg>
      );
  }
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
  const [shareMessage, setShareMessage] = useState('');

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const deleteMutation = useDeletePostMutation();
  const likeMutation = useLikeMutation();
  const unlikeMutation = useUnlikeMutation();
  const saveMutation = useSavePostMutation();
  const unsaveMutation = useUnsavePostMutation();

  const isOwner = user?.id === post.author.id;

  const isLikePending = likeMutation.isPending || unlikeMutation.isPending;

  const isSavePending = saveMutation.isPending || unsaveMutation.isPending;

  const savedPostsQuery = useSavedPostsQuery({}, isAuthenticated);

  const isSaved =
    savedPostsQuery.data?.data?.posts?.some(
      (savedPost) => savedPost.id === post.id
    ) ?? false;

  function handleDeletePost() {
    if (!isOwner || deleteMutation.isPending) return;

    const confirmed = window.confirm(
      'Apakah kamu yakin ingin menghapus postingan ini?'
    );

    if (confirmed) {
      deleteMutation.mutate(post.id);
    }
  }

  function handleLikeToggle() {
    if (!isAuthenticated || isLikePending) return;

    if (post.likedByMe) {
      unlikeMutation.mutate(post.id);
    } else {
      likeMutation.mutate(post.id);
    }
  }

  function handleSaveToggle() {
    if (!isAuthenticated || isSavePending) return;

    if (isSaved) {
      unsaveMutation.mutate(post.id);
    } else {
      saveMutation.mutate(post.id);
    }
  }

  async function handleShare() {
    const postUrl = new URL(window.location.href);
    postUrl.hash = `post-${post.id}`;

    try {
      await navigator.clipboard.writeText(postUrl.toString());
      setShareMessage('Tautan disalin!');
    } catch {
      setShareMessage('Gagal menyalin tautan.');
    }

    window.setTimeout(() => setShareMessage(''), 2500);
  }

  return (
    <article
      id={`post-${post.id}`}
      className='overflow-hidden rounded-2xl border border-white/10 bg-[#111014] text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
    >
      {/* Header penulis */}
      <div className='flex items-center gap-3 px-4 py-4 sm:px-5'>
        <Link
          href={`/users/${encodeURIComponent(post.author.username)}`}
          className='shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-500'
          aria-label={`Lihat profil ${authorName}`}
        >
          {post.author.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt={`Avatar ${authorName}`}
              width={44}
              height={44}
              unoptimized
              className='size-11 rounded-full border border-white/10 object-cover'
            />
          ) : (
            <div className='flex size-11 items-center justify-center rounded-full border border-purple-400/20 bg-purple-500/15 text-base font-semibold text-purple-300'>
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className='min-w-0 flex-1'>
          <Link
            href={`/users/${encodeURIComponent(post.author.username)}`}
            className='block truncate text-sm font-semibold text-white transition-colors hover:text-purple-300'
          >
            {authorName}
          </Link>

          <p className='truncate text-xs text-white/45'>
            @{post.author.username}
          </p>

          <time
            dateTime={post.createdAt}
            className='mt-0.5 block text-[11px] text-white/35'
          >
            {formatPostDate(post.createdAt)}
          </time>
        </div>

        {isOwner && (
          <button
            type='button'
            onClick={handleDeletePost}
            disabled={deleteMutation.isPending}
            className='rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </button>
        )}
      </div>

      {/* Gambar postingan */}
      {post.imageUrl && (
        <div className='relative flex max-h-[600px] justify-center overflow-hidden bg-black'>
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

      {/* Caption berada di bawah gambar */}
      {post.caption && (
        <div className='px-4 pt-4 sm:px-5'>
          <p className='whitespace-pre-wrap break-words text-sm leading-6 text-white/85'>
            <Link
              href={`/users/${encodeURIComponent(post.author.username)}`}
              className='mr-2 font-semibold text-white hover:text-purple-300'
            >
              {post.author.username}
            </Link>
            {post.caption}
          </p>
        </div>
      )}

      {/* Aksi postingan */}
      <div className='flex items-center gap-5 px-4 pb-4 pt-4 sm:gap-6 sm:px-5'>
        <button
          type='button'
          onClick={handleLikeToggle}
          disabled={!isAuthenticated || isLikePending}
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? 'Batalkan suka' : 'Sukai postingan'}
          title={
            isAuthenticated
              ? post.likedByMe
                ? 'Batalkan suka'
                : 'Sukai postingan'
              : 'Login untuk menyukai postingan'
          }
          className={`inline-flex items-center gap-2 rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            post.likedByMe
              ? 'text-purple-400'
              : 'text-white/60 hover:text-purple-300'
          }`}
        >
          <Icon name='heart' filled={post.likedByMe} className='size-[22px]' />
          <span>{post.likeCount}</span>
        </button>

        <button
          type='button'
          onClick={() => setIsCommentsOpen((previous) => !previous)}
          aria-expanded={isCommentsOpen}
          aria-controls={`post-comments-${post.id}`}
          className={`inline-flex items-center gap-2 rounded-lg text-sm transition-colors ${
            isCommentsOpen
              ? 'text-purple-300'
              : 'text-white/60 hover:text-purple-300'
          }`}
          aria-label='Tampilkan komentar'
        >
          <Icon name='message' className='size-[21px]' />
          <span>{post.commentCount}</span>
        </button>

        <button
          type='button'
          onClick={handleShare}
          className='inline-flex items-center rounded-lg text-white/60 transition-colors hover:text-purple-300'
          aria-label='Salin tautan postingan'
          title='Salin tautan postingan'
        >
          <Icon name='share' className='size-[21px]' />
        </button>

        <button
          type='button'
          onClick={handleSaveToggle}
          disabled={!isAuthenticated || isSavePending}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Hapus dari Saved Posts' : 'Simpan postingan'}
          title={
            isAuthenticated
              ? isSaved
                ? 'Hapus dari Saved Posts'
                : 'Simpan postingan'
              : 'Login untuk menyimpan postingan'
          }
          className={`ml-auto inline-flex items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isSaved ? 'text-purple-400' : 'text-white/60 hover:text-purple-300'
          }`}
        >
          <Icon name='bookmark' filled={isSaved} className='size-[21px]' />
        </button>
      </div>

      {shareMessage && (
        <p role='status' className='px-4 pb-3 text-xs text-purple-300 sm:px-5'>
          {shareMessage}
        </p>
      )}

      {(likeMutation.isError || unlikeMutation.isError) && (
        <p role='alert' className='px-4 pb-3 text-sm text-red-400 sm:px-5'>
          Gagal memperbarui Like. Silakan coba lagi.
        </p>
      )}

      {(saveMutation.isError || unsaveMutation.isError) && (
        <p role='alert' className='px-4 pb-3 text-sm text-red-400 sm:px-5'>
          Gagal menyimpan perubahan. Silakan coba lagi.
        </p>
      )}

      {deleteMutation.isError && (
        <p role='alert' className='px-4 pb-3 text-sm text-red-400 sm:px-5'>
          Gagal menghapus postingan. Silakan coba lagi.
        </p>
      )}

      {isCommentsOpen && (
        <div
          id={`post-comments-${post.id}`}
          className='border-t border-white/10'
        >
          <PostComments postId={post.id} />
        </div>
      )}
    </article>
  );
}
