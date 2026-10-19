"use client";

import Image from "next/image";
import { useLikeMutation, useUnlikeMutation } from "../posts.hooks";
import type { Post } from "../posts.types";
import PostComments from "./PostComments";

interface PostCardProps {
  post: Post;
}

function formatPostDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function PostCard({ post }: PostCardProps) {
  const authorName = post.author.name || post.author.username;
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

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3 p-4">
        {post.author.avatarUrl ? (
          <Image
            src={post.author.avatarUrl}
            alt={`Avatar ${authorName}`}
            width={44}
            height={44}
            unoptimized
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{authorName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{post.author.username}
          </p>
          <time
            dateTime={post.createdAt}
            className="text-xs text-gray-500 dark:text-gray-400"
          >
            {formatPostDate(post.createdAt)}
          </time>
        </div>
      </div>

      {post.caption && (
        <p className="whitespace-pre-wrap break-words px-4 pb-4 text-sm leading-6">
          {post.caption}
        </p>
      )}

      {post.imageUrl && (
        <div className="relative flex max-h-[600px] justify-center overflow-hidden bg-gray-100 dark:bg-gray-950">
          <Image
            src={post.imageUrl}
            alt={`Postingan oleh ${authorName}`}
            width={1200}
            height={1200}
            unoptimized
            className="h-auto max-h-[600px] w-full object-contain"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-5 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <button
          type="button"
          onClick={handleLikeToggle}
          disabled={isLikePending}
          aria-pressed={post.likedByMe}
          aria-label={post.likedByMe ? "Batalkan suka" : "Sukai postingan"}
          className={`inline-flex items-center gap-2 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            post.likedByMe
              ? "font-semibold text-red-600 dark:text-red-400"
              : "hover:text-red-600 dark:hover:text-red-400"
          }`}
        >
          <span aria-hidden="true">{post.likedByMe ? "♥" : "♡"}</span>
          <span>
            {isLikePending
              ? "Memproses..."
              : post.likedByMe
                ? "Disukai"
                : "Suka"}
          </span>
          <span>{post.likeCount}</span>
        </button>

        <span aria-label={`${post.commentCount} komentar`}>
          ◯ {post.commentCount} komentar
        </span>
      </div>

      {(likeMutation.isError || unlikeMutation.isError) && (
        <p role="alert" className="px-4 pb-3 text-sm text-red-600 dark:text-red-400">
          Gagal memperbarui Like. Silakan coba lagi.
        </p>
      )}
      <PostComments postId={post.id} />
    </article>
  );
}

