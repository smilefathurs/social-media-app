"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { Post } from "../posts.types";
import {
  usePostCommentsQuery,
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
  useDeletePostMutation,
  useLikeMutation,
  useUnlikeMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useSavedPostsQuery,
} from "../posts.hooks";
import { useAppSelector } from "@/lib/redux/hooks";

interface Props {
  post: Post;
  onClose: () => void;
}

const EMOJIS = [
  "😀", "😂", "🥰", "😍", "😊", "😎",
  "😭", "🥹", "🔥", "❤️", "👏", "🙌",
  "👍", "🙏", "✨", "💯", "🎉", "🤍",
];

function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function Avatar({
  src,
  name,
  size = "size-10",
}: {
  src?: string | null;
  name: string;
  size?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-full bg-[#252832] flex items-center justify-center text-sm font-semibold text-white`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
}

export default function PostCommentsModal({ post, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [localLiked, setLocalLiked] = useState(post.likedByMe);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const user = useAppSelector((state) => state.auth.user);
  const commentsQuery = usePostCommentsQuery(post.id, { page: 1, limit: 30 });
  const addMutation = useAddPostCommentMutation(post.id);
  const deleteMutation = useDeletePostCommentMutation(post.id);
  const deletePostMutation = useDeletePostMutation();
  const likeMutation = useLikeMutation();
  const unlikeMutation = useUnlikeMutation();
  const saveMutation = useSavePostMutation();
  const unsaveMutation = useUnsavePostMutation();
  const savedQuery = useSavedPostsQuery({ page: 1, limit: 100 });

  const savedPosts = savedQuery.data?.data.posts ?? [];
  const isSaved = savedPosts.some((item) => item.id === post.id);
  const comments = commentsQuery.data?.data.comments ?? [];
  const authorName = post.author.name || post.author.username;
  function handleDeletePost() {
    if (user?.id !== post.author.id || deletePostMutation.isPending) return;

    if (!window.confirm("Apakah kamu yakin ingin menghapus postingan ini?")) {
      return;
    }

    deletePostMutation.mutate(post.id, {
      onSuccess: () => {
        setPostMenuOpen(false);
        onClose();
      },
    });
  }

  useEffect(() => {
    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || addMutation.isPending) return;

    addMutation.mutate(trimmed, {
      onSuccess: () => {
        setText("");
        setEmojiOpen(false);
        inputRef.current?.focus();
      },
    });
  }

  function insertEmoji(emoji: string) {
    const input = inputRef.current;
    if (!input) {
      setText((current) => current + emoji);
      return;
    }

    const start = input.selectionStart ?? text.length;
    const end = input.selectionEnd ?? start;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    setEmojiOpen(false);

    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + emoji.length;
      input.setSelectionRange(cursor, cursor);
    });
  }

  function toggleLike() {
    if (localLiked) {
      setLocalLiked(false);
      setLocalLikeCount((count) => Math.max(0, count - 1));
      unlikeMutation.mutate(post.id, {
        onError: () => {
          setLocalLiked(true);
          setLocalLikeCount((count) => count + 1);
        },
      });
    } else {
      setLocalLiked(true);
      setLocalLikeCount((count) => count + 1);
      likeMutation.mutate(post.id, {
        onError: () => {
          setLocalLiked(false);
          setLocalLikeCount((count) => Math.max(0, count - 1));
        },
      });
    }
  }

  async function handleShare() {
    const url = new URL(window.location.href);
    url.hash = `post-${post.id}`;

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareMessage("Link copied!");
    } catch {
      setShareMessage("Unable to copy link.");
    }
  }

  if (!mounted) return null;

  const actionButtons = (
    <div className="flex items-center gap-5 text-white">
      <button
        type="button"
        onClick={toggleLike}
        aria-label={localLiked ? "Unlike post" : "Like post"}
        className={localLiked ? "text-purple-400" : "text-white hover:text-purple-300"}
      >
        <svg viewBox="0 0 24 24" className="size-6" fill={localLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        </svg>
      </button>
      <span className="text-sm text-white/65">{localLikeCount}</span>
      <span className="text-white/80">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
        </svg>
      </span>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Copy post link"
        className="text-white/80 hover:text-purple-300"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => {
          if (isSaved) unsaveMutation.mutate(post.id);
          else saveMutation.mutate(post.id);
        }}
        aria-label={isSaved ? "Unsave post" : "Save post"}
        className={isSaved ? "text-purple-400" : "ml-auto text-white/80 hover:text-purple-300"}
      >
        <svg viewBox="0 0 24 24" className="size-6" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
          <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-4-6 4V4.8Z" />
        </svg>
      </button>
    </div>
  );

  const commentList = (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 [scrollbar-color:#414651_#0A0D12] [scrollbar-width:thin] sm:px-5">
      <div className="flex gap-3 border-b border-white/[0.07] py-4">
        <Avatar src={post.author.avatarUrl} name={authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-sm font-semibold text-white">{authorName}</span>
            <span className="text-xs text-white/40">@{post.author.username}</span>
            <span className="text-xs text-white/40">{relativeTime(post.createdAt)}</span>
          </div>
          {post.caption && (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-white/85">
              {post.caption}
            </p>
          )}
        </div>
        {user?.id === post.author.id && (
          <div className="relative ml-auto shrink-0">
            <button
              type="button"
              aria-label="Menu postingan"
              aria-haspopup="menu"
              aria-expanded={postMenuOpen}
              onClick={() => setPostMenuOpen((open) => !open)}
              className="flex size-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>

            {postMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-white/10 bg-[#171A22] p-1 shadow-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={deletePostMutation.isPending}
                  onClick={handleDeletePost}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {commentsQuery.isLoading && (
        <p className="py-8 text-center text-sm text-white/50">Loading comments...</p>
      )}

      {commentsQuery.isError && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-300">Could not load comments.</p>
          <button type="button" onClick={() => commentsQuery.refetch()} className="mt-2 text-sm text-purple-300 underline">
            Try again
          </button>
        </div>
      )}

      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && (
        <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
          <div className="mb-3 flex size-14 items-center justify-center rounded-full border border-white/15 text-2xl">
            💬
          </div>
          <p className="text-base font-semibold text-white">No Comments yet</p>
          <p className="mt-1 text-sm text-white/45">Start the conversation</p>
        </div>
      )}

      {comments.map((comment) => {
        const canDelete =
          user?.id === comment.author.id || user?.id === post.author.id;

        return (
          <article key={comment.id} className="flex gap-3 border-b border-white/[0.07] py-4 last:border-b-0">
            <Avatar src={comment.author.avatarUrl} name={comment.author.name || comment.author.username} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-semibold text-white">
                  {comment.author.name || comment.author.username}
                </span>
                <span className="text-xs text-white/40">{relativeTime(comment.createdAt)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-white/85">
                {comment.text}
              </p>
              {canDelete && (
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm("Delete this comment?")) {
                      deleteMutation.mutate(comment.id);
                    }
                  }}
                  className="mt-2 text-xs text-white/40 hover:text-red-300 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        );
      })}

      {deleteMutation.isError && (
        <p role="alert" className="py-2 text-xs text-red-300">Could not delete comment.</p>
      )}
    </div>
  );

  const commentComposer = (
    <div className="relative shrink-0 border-t border-white/10 bg-[#0A0D12] p-3 sm:p-4">
      {emojiOpen && (
        <div className="absolute bottom-full left-3 right-3 z-20 mb-2 grid grid-cols-6 gap-1 rounded-2xl border border-white/10 bg-[#171A22] p-3 shadow-2xl sm:left-4 sm:right-auto sm:w-[280px]">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="flex aspect-square items-center justify-center rounded-lg text-xl hover:bg-white/10"
              aria-label={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {addMutation.isError && (
        <p role="alert" className="mb-2 text-xs text-red-300">Could not post comment. Please try again.</p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => setEmojiOpen((open) => !open)}
          aria-label="Select emoji"
          aria-expanded={emojiOpen}
          className="mb-1 flex size-9 shrink-0 items-center justify-center rounded-full text-xl text-white/70 hover:bg-white/10 hover:text-white"
        >
          ☺
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Add a comment..."
          aria-label="Add a comment"
          maxLength={1000}
          rows={1}
          className="max-h-28 min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-white/10 bg-[#171A22] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-purple-400"
        />
        <button
          type="submit"
          disabled={!text.trim() || addMutation.isPending}
          className="mb-0.5 rounded-lg bg-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {addMutation.isPending ? "..." : "Post"}
        </button>
      </form>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/75 text-white"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Desktop: modal dua kolom */}
      <div className="hidden h-full w-full items-center justify-center p-8 md:flex">
        <div className="relative flex h-[min(720px,calc(100dvh-100px))] w-full max-w-[1200px] overflow-visible">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="absolute -right-1 -top-12 z-20 flex size-10 items-center justify-center rounded-full text-3xl text-white hover:bg-white/10"
          >
            ×
          </button>

          <div className="relative flex min-w-0 flex-[3] items-center justify-center overflow-hidden bg-black">
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="Post image" className="size-full object-contain" />
            ) : (
              <div className="p-8 text-center text-white/70">{post.caption}</div>
            )}
          </div>

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Post comments"
            className="flex min-w-0 flex-[2] flex-col border-l border-white/10 bg-[#0A0D12]"
          >

            {commentList}

            <div className="shrink-0 border-t border-white/10 px-4 py-3">
              {actionButtons}
              <p className="mt-2 text-xs text-white/45">{localLikeCount} likes</p>
              {shareMessage && <p role="status" className="mt-1 text-xs text-purple-300">{shareMessage}</p>}
            </div>
            {commentComposer}
          </section>
        </div>
      </div>

      {/* Mobile: gambar di belakang dan bottom sheet komentar */}
      <div className="relative h-full md:hidden">
        <div className="absolute inset-0 flex items-start justify-center overflow-hidden bg-black">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" className="mt-[5vh] max-h-[55vh] w-full object-contain opacity-70" />
          ) : (
            <p className="mt-20 px-6 text-center text-white/60">{post.caption}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close comments"
          className="absolute right-4 top-5 z-30 flex size-10 items-center justify-center rounded-full bg-black/50 text-3xl text-white hover:bg-black/80"
        >
          ×
        </button>

        <section
          role="dialog"
          aria-modal="true"
          aria-label="Post comments"
          className="absolute inset-x-0 bottom-0 z-20 flex h-[68dvh] flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-[#0A0D12] shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-white/25" />
          </div>
          <header className="flex shrink-0 items-center justify-center border-b border-white/10 px-4 pb-4 pt-2">
            <h2 className="text-base font-semibold">Comments</h2>
          </header>

          {commentList}

          <div className="shrink-0 border-t border-white/10 px-4 py-3">
            {actionButtons}
            <p className="mt-2 text-xs text-white/45">{localLikeCount} likes</p>
            {shareMessage && <p role="status" className="mt-1 text-xs text-purple-300">{shareMessage}</p>}
          </div>
          {commentComposer}
        </section>
      </div>
    </div>,
    document.body
  );
}
