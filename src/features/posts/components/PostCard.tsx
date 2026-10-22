'use client';

import React, { useEffect, useState } from 'react';
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
import PostLikesModal from './PostLikesModal';

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
  if (name === 'more') {
    return (
      <svg
        className={className}
        viewBox='0 0 24 24'
        fill='currentColor'
        aria-hidden='true'
      >
        <circle cx='5' cy='12' r='1' />
        <circle cx='12' cy='12' r='1' />
        <circle cx='19' cy='12' r='1' />
      </svg>
    );
  }

  const iconSrc =
    name === 'heart'
      ? filled
        ? '/icons/like-active.svg'
        : '/icons/like-normal.svg'
      : name === 'message'
        ? '/icons/comment.svg'
        : name === 'share'
          ? '/icons/share.svg'
          : filled
            ? '/icons/save-active.svg'
            : '/icons/save-normal.svg';

  return (
    <img
      src={iconSrc}
      alt=''
      aria-hidden='true'
      className={`${className} shrink-0 object-contain`}
    />
  );
}

function formatPostDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';

  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minutes'} Ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'Hour' : 'Hours'} Ago`;
  }

  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'} Ago`;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function CaptionText({
  username,
  caption,
}: {
  username: string;
  caption: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isMeasured, setIsMeasured] = useState(false);

  const captionRef = React.useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = captionRef.current;
    if (!element) return;

    setIsTruncated(element.scrollHeight > element.clientHeight + 1);
    setIsMeasured(true);
  }, [caption, username]);

  return (
    <div className='mx-auto w-full max-w-[600px] px-4 pt-4 sm:px-0'>
      <p
        ref={captionRef}
        className={`break-words text-sm leading-6 text-white/85 ${
          isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'
        }`}
      >
        <Link
          href={`/users/${encodeURIComponent(username)}`}
          className='mr-2 font-semibold text-white hover:text-purple-300'
        >
          {username}
        </Link>
        {caption}
      </p>

      {isMeasured && isTruncated && (
        <button
          type='button'
          onClick={() => setIsExpanded((previous) => !previous)}
          className='mt-1 cursor-pointer text-sm font-medium text-purple-400 hover:text-purple-300'
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}
export default function PostCard({ post }: PostCardProps) {
  const authorName = post.author.name || post.author.username;
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  function handleImageLoad(
    event: React.SyntheticEvent<HTMLImageElement>
  ) {
    const image = event.currentTarget;

    if (image.naturalWidth <= 1 || image.naturalHeight <= 1) {
      setImageFailed(true);
    }
  }

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
    <article id={`post-${post.id}`} className='relative text-white'>
      {/* Header penulis */}
      <div className='mx-auto flex w-full max-w-[600px] items-center gap-3 px-4 py-4 sm:px-0'>
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
            className='rounded-lg px-3 py-2 cursor-pointer text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </button>
        )}
      </div>

      {/* Gambar postingan */}
      {post.imageUrl && !imageFailed && (
        <div className='relative mx-auto w-full max-w-[600px]'>
          {isLikesOpen && (
            <PostLikesModal
              postId={post.id}
              onClose={() => setIsLikesOpen(false)}
            />
          )}
          <div className='relative aspect-square w-full overflow-hidden bg-black'>
          <Image
            src={post.imageUrl}
            alt={`Postingan oleh ${authorName}`}
            fill
            unoptimized
            onLoad={handleImageLoad}
            onError={() => setImageFailed(true)}
            className='rounded-md object-cover'
            sizes='(max-width: 600px) 100vw, 600px'
          />
          </div>
        </div>
      )}

      {/* Caption: dua baris dengan opsi Show More */}
      {post.caption && (
        <CaptionText username={post.author.username} caption={post.caption} />
      )}

      {/* Aksi postingan */}
      <div className='mx-auto flex w-full max-w-[600px] items-center gap-5 px-4 pb-4 pt-4 sm:gap-6 sm:px-0'>
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
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
            className={`inline-flex cursor-pointer items-center rounded-lg text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              post.likedByMe
                ? 'text-purple-400'
                : 'text-white/60 hover:text-purple-300'
            }`}
          >
            <Icon name="heart" filled={post.likedByMe} className="size-[22px]" />
          </button>
          <button
            type="button"
            onClick={() => setIsLikesOpen(true)}
            aria-label={`Lihat ${post.likeCount} pengguna yang menyukai postingan`}
            className="cursor-pointer rounded-md text-sm text-white/60 transition-colors hover:text-purple-300"
          >
            {post.likeCount}
          </button>
        </div>

        <button
          type='button'
          onClick={() => setIsCommentsOpen((previous) => !previous)}
          aria-expanded={isCommentsOpen}
          aria-controls={`post-comments-${post.id}`}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-lg text-sm transition-colors ${
            isCommentsOpen
              ? 'text-purple-300'
              : 'text-white/60 hover:text-purple-300'
          }`}
          aria-label='Tampilkan komentar'
        >
          <Icon name='message' className='size-[21px]' />
          <span>{post.commentCount}</span>
        </button>

        {/* Share Icon */}
        <button
          type='button'
          onClick={handleShare}
          className='inline-flex cursor-pointer items-center rounded-lg text-white transition-colors hover:text-purple-300'
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
          className={`ml-auto inline-flex cursor-pointer items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isSaved ? 'text-purple-400' : 'text-white/60 hover:text-purple-300'
          }`}
        >
          <Icon name='bookmark' filled={isSaved} className='size-[21px]' />
        </button>
      </div>

      {shareMessage && (
        <p
          role='status'
          className='mx-auto w-full max-w-[600px] px-4 pb-3 text-xs text-purple-300 sm:px-0'
        >
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
